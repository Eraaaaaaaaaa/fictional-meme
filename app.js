const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());

// MongoDB connection (replace with your MongoDB URI if necessary)
mongoose.connect('mongodb://localhost:27017/usersearch', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB...'))
.catch((err) => console.error('Could not connect to MongoDB...', err));

// Define a user schema and model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Route to add a new user
app.post('/add-user', async (req, res) => {
  try {
    const { name, email, age } = req.body;

    // Create a new user instance
    const user = new User({ name, email });

    // Save the user to MongoDB
    await user.save();

    res.status(201).send('User added successfully');
  } catch (error) {
    res.status(500).send('Error adding user: ' + error.message);
  }
});

// Route to fetch all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();  // Fetch all users from MongoDB
    res.status(200).json(users);      // Send users as JSON
  } catch (error) {
    res.status(500).send('Error fetching users: ' + error.message);
  }
});

// Route to search for users by name
app.get('/search-users', async (req, res) => {
  // Get the search query from the query parameters
  const searchQuery = req.query.searchQuery;

  if (!searchQuery) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Use the search query in the database query to find matching users
    const users = await User.find({
      name: { $regex: searchQuery, $options: 'i' },  // 'i' for case-insensitive
    });

    // Check if no users were found
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Return the found users
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Start the server
const PORT = process.env.PORT || 3768;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
