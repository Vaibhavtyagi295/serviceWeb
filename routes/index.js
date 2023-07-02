var express = require('express');
var router = express.Router();
var passport = require('passport');
const User = require('./users');
const {Category, Subcategory }  = require("./Categoriescreate");
const Worker  = require("./worker");
const Post  = require("./Post");
const cors = require('cors'); 
const Customer = require('./CustomerData');

const multer = require("multer")
const LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(User.authenticate()));

/* GET home page. */

router.get('/noone', function(req, res) {
  res.render("index")
});

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  const newUser = new User({ username, email });

  User.register(newUser, password, (error, user) => {
    if (error) {
      console.error('An error occurred:', error);
      return res.status(500).json({ message: 'An error occurred' });
    }

    passport.authenticate('local')(req, res, () => {
      res.render('login'); // Replace this with the appropriate response for successful registration
    });
  });
});




router.get("/logout",function(req,res,next){
  req.logout(function(err){
    if (err) {return next(err)}
    res.redirect('/')
  })
});


// Middleware function to check if the user is an admin
function checkAdmin(req, res, next) {
  // Assuming you have stored the user information in the request object
  const { user } = req;

  // Check if the user is logged in and has the role of "admin"
  if (user && user.role === "admin") {
    // User is an admin, allow them to proceed
    next();
  } else {
    // User is not an admin, return an error response
    res.status(403).json({ error: "Only admin users can create categories" });
  }
}

// Route to create a category (only accessible by admin)

const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Create a category
const { v4: uuidv4 } = require('uuid');
const { route } = require('../app');
const { Router } = require('express');

// Function to generate a unique ID for the category
const generateUniqueId = () => {
  return uuidv4(); // Using UUID v4 for generating unique IDs
};
router.post('/categories', upload.single('image'), (req, res) => {
  const { name } = req.body;
  const categoryId = uuidv4(); // Generate a unique ID for the category

  const category = new Category({
    id: categoryId,
    name: name,
    image: req.file.filename, // Assuming the field name for the image is 'image'
  });

  category
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      console.error('Error creating category:', err);
      res.status(500).json({ error: 'Failed to create category' });
    });
});

// Create a sub-category
router.post('/categories/:categoryId/subcategories', upload.single('image'), (req, res) => {
  const categoryId = req.params.categoryId;
  const { name } = req.body;

  const subcategory = new Subcategory({
    name: name,
    category: categoryId,
    image: req.file.filename, // Assuming the field name for the image is 'image'
  });

  subcategory
    .save()
    .then((result) => {
      // Update the category's subcategories array
      return Category.findByIdAndUpdate(
        categoryId,
        { $push: { subcategories: result._id } },
        { new: true }
      );
    })
    .then((category) => {
      res.status(201).json(category);
    })
    .catch((err) => {
      console.error('Error creating sub-category:', err);
      res.status(500).json({ error: 'Failed to create sub-category' });
    });
});

router.get('/category', (req, res) => {
  Category.find()
    .then((categories) => {
      res.json(categories);
    })
    .catch((error) => {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    });
});


// GET route to fetch subcategories for a specific category
router.get('/category/:categoryId/subcategories', (req, res) => {
  const categoryId = req.params.categoryId;

  Subcategory.find({id: categoryId })
    .populate('workers')
    .then((subcategories) => {
      res.status(200).json(subcategories);
    })
    .catch((err) => {
      console.error('Error fetching subcategories:', err);
      res.status(500).json({ error: 'Failed to fetch subcategories' });
    });
});
router.get('/subcategory/:subcategoryId/workers', (req, res) => {
  const subcategoryId = req.params.subcategoryId;

  Worker.find({ subcategory: subcategoryId })
    .then((workers) => {
      res.status(200).json(workers);
    })
    .catch((err) => {
      console.error('Error fetching workers:', err);
      res.status(500).json({ error: 'Failed to fetch workers' });
    });
});

// GET route to fetch category details by ID
router.get('/category/:categoryId', (req, res) => {
  const categoryId = req.params.categoryId;

  Category.findById(categoryId)
    .populate('subcategories') // If you want to populate the subcategories data as well
    .then((category) => {
      res.status(200).json(category);
    })
    .catch((err) => {
      console.error('Error fetching category details:', err);
      res.status(500).json({ error: 'Failed to fetch category details' });
    });
});





// GET route to fetch all workers

// router.post('/workerregister', upload.single('image'), (req, res, next) => {
//   const { username, password, name, number, categories, subcategories, workDescription } = req.body;
//   const location = req.body.location;
//   const subcategory = req.body.subcategory;

//   const newWorker = new Worker({
//     username,
//     password,
//     name,
//     number,
//     categories,
//     subcategories,
//     subcategory,
//     workDescription,
//     approvalStatus: 'pending',
//     image: req.file.filename
//   });

//   newWorker.save()
//     .then(savedWorker => {
//       res.json({ message: 'Worker registration request sent for approval!' });
//     })
//     .catch(error => {
//       console.error('Failed to register worker:', error);
//       res.status(500).json({ error: 'Failed to register worker' });
//     });
    
// });



router.post('/workerregister', (req, res) => {
  const { username,location, password, name, number, categories, subcategories, workDescription } = req.body;
  const subcategory = req.body.subcategory;
  const newWorker = new Worker({
    username,
    name,
    number,
    location,
    categories,
    subcategories,
    subcategory,
    workDescription
  });

  Worker.register(newWorker, password, (err, worker) => {
    if (err) {
      console.error('Failed to register worker:', err);
      return res.status(500).json({ error: 'Failed to register worker' });
    }

    res.json({ message: 'Worker registration successful!' });
  });
});

// Worker authentication
passport.use('worker-local', new LocalStrategy(Worker.authenticate()));
passport.serializeUser(Worker.serializeUser());
passport.deserializeUser(Worker.deserializeUser());

// User authentication
passport.use('user-local', new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Login routes


router.post('/login', passport.authenticate('local'), (req, res) => {
  // Redirect the user to their profile upon successful login
  res.redirect('/');
});

// Initialize passport middleware
router.use(passport.initialize());
router.use(passport.session());

router.post('/workerlogin', passport.authenticate('worker-local'), (req, res) => {
  // If the authentication is successful, this callback function will be called
  // You can perform any additional logic here or send a response to the client

  // Send a success message to the client
  res.json({ message: 'Worker login successful!' });
});
passport.serializeUser(Worker.serializeUser());
passport.deserializeUser(Worker.deserializeUser());


router.get('/workerregister', (req, res) => {
  Worker.find()
    .then((workers) => {
      res.status(200).json(workers);
    })
    .catch((err) => {
      console.error('Error fetching workers:', err);
      res.status(500).json({ error: 'Failed to fetch workers' });
    });
});


router.get('/getUserRole', passport.authenticate('local', { session: false }), (req, res) => {
  const userId = req.user._id;

  User.findById(userId)
    .then(user => {
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
      } else {
        const role = user.role;
        res.status(200).json({ success: true, role: role });
      }
    })
    .catch(error => {
      res.status(500).json({ success: false, message: 'Internal server error' });
    });
});

// GET route to fetch pending worker registration requests
router.get('/workerregister/requests', (req, res) => {
  Worker.find({ approvalStatus: 'pending' })
    .then((requests) => {
      res.status(200).json(requests);
    })
    .catch((err) => {
      console.error('Error fetching worker registration requests:', err);
      res.status(500).json({ error: 'Failed to fetch worker registration requests' });
    });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login'); // Redirect the user to the login page
  }
}


// Assuming you have your Express app set up and configured with passport.session

// Create an API endpoint to check the login status
router.get('/api/check-login', (req, res) => {
  // Check if the user is authenticated using req.isAuthenticated() provided by passport.session
  if (req.isAuthenticated()) {
    // User is authenticated
    res.json({ isLoggedIn: true });
  } else {
    // User is not authenticated
    res.json({ isLoggedIn: false });
  }
});

// PATCH route to approve or reject worker registration requests
router.patch('/workerregister/requests/:id', (req, res) => {
  const { id } = req.params;
  const { approvalStatus } = req.body;

  Worker.findByIdAndUpdate(id, { approvalStatus }, { new: true })
    .then((worker) => {
      if (!worker) {
        return res.status(404).json({ error: 'Worker registration request not found' });
      }
      if (approvalStatus === 'approved') {
        res.json({ message: 'Worker registration request approved' });
      } else if (approvalStatus === 'rejected') {
        Worker.findByIdAndRemove(id)
          .then(() => {
            res.json({ message: 'Worker registration request rejected and removed' });
          })
          .catch((err) => {
            console.error('Error removing worker registration request:', err);
            res.status(500).json({ error: 'Failed to remove worker registration request' });
          });
      } else {
        res.status(400).json({ error: 'Invalid approval status' });
      }
    })
    .catch((err) => {
      console.error('Error updating worker registration request:', err);
      res.status(500).json({ error: 'Failed to update worker registration request' });
    });
});

router.get('/api/worker/:id', (req, res) => {
req.params._id; // Replace with the specific worker ID you want to fetch

  // Assuming you have a Worker model or data access layer to retrieve the worker data
  Worker.findById(req.params.id) // Use the workerId variable instead of req.params.id
    .then((worker) => {
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }
      res.json(worker);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    });
});




router.get('/api/worker/:workerId/rating', async (req, res) => {
  try {
    const { workerId } = req.params;

    // Assuming you are using MongoDB and have a Worker model defined
    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const { reviews } = worker;
    if (reviews.length === 0) {
      return res.json({ averageRating: 0 }); // Return 0 if no reviews found
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    res.json({ averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to calculate average rating' });
  }
});

router.post('/api/saveNameAndNumber', async (req, res) => {
  try {
    const { name, number } = req.body;

    // Create a new instance of the Customer model with the provided name and number
    const customer = new Customer({
      name,
      number
    });

    // Save the customer data to the database
    await customer.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save the data' });
  }
});

// POST /api/posts: Create a new post
router.post('/api/posts', upload.single('image'), (req, res) => {
  // Get the post data from the request body
  const { author, content } = req.body;

  // Get the uploaded image file
  const image = req.file;

  // Create a new post instance
  const newPost = new Post({
    author,
    content,
    image: image ? image.filename : undefined, // Store the image filename in the post object if an image was uploaded
    likes: 0,
    comments: [],
    shares: 0,
    timestamp: new Date(),
  });

  // Save the new post to the database
  newPost.save()
    .then((savedPost) => {
      res.status(201).json(savedPost);
    })
    .catch((error) => {
      console.error('Error saving post:', error);
      res.status(500).json({ error: 'An error occurred while saving the post' });
    });
});


// POST /api/posts/:postId/like: Increment the like count for a post
router.post('/api/posts/:postId/like', (req, res) => {
  const postId = req.params.postId;

  // Find the post by its id and increment the like count
  Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { new: true })
    .then((updatedPost) => {
      if (!updatedPost) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(updatedPost);
    })
    .catch((error) => {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'An error occurred while updating the post' });
    });
});

// POST /api/posts/:postId/comment: Add a comment to a post
router.post('/api/posts/:postId/comment', (req, res) => {
  const postId = req.params.postId;
  const { comment } = req.body;

  // Find the post by its id and add the comment
  Post.findByIdAndUpdate(postId, { $push: { comments: comment } }, { new: true })
    .then((updatedPost) => {
      if (!updatedPost) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(updatedPost);
    })
    .catch((error) => {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'An error occurred while updating the post' });
    });
});

// POST /api/posts/:postId/share: Share a post
router.post('/api/posts/:postId/share', (req, res) => {
  const postId = req.params.postId;

  // Find the post by its id and increment the share count
  Post.findByIdAndUpdate(postId, { $inc: { shares: 1 } }, { new: true })
    .then((updatedPost) => {
      if (!updatedPost) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(updatedPost);
    })
    .catch((error) => {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'An error occurred while updating the post' });
    });
});



module.exports = router;
