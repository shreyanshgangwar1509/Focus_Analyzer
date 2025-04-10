import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import User from './models/User.model.js';
import jwt from 'jsonwebtoken';
import Session from './models/Session.model.js';

const app = express();
app.use(express.json());
app.use(cors());
const JWT_SECRET = "HI";


mongoose.connect('mongodb://127.0.0.1:27017/focus_analyzer');

app.post('/register',async  (req, res)=>{
    // To post / insert data into database

    const {email, password} = req.body;
    await User.findOne({email: email})
    .then(async (user) => {
        if(user){
            res.json("Already registered")
        }
        else{
            await User.create(req.body)
            .then(log_reg_form => res.json(log_reg_form))
            .catch(err => res.json(err))
        }
    })
    
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        // console.log(user);

        if (user) {
            if (user.password == password) {

                const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '10h' });
                
                res.json({
                    message: "Success",
                    token: token
                });
            } else {
                res.json({ message: "Wrong password" });
            }
        } else {
            res.json({ message: "No records found!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


app.post("/save_results", async (req, res) => {
  const { email, results } = req.body;

  if (!email || !results || !Array.isArray(results)) {
    return res.status(400).json({ error: "Email and results array required." });
  }

  try {
    const session = new Session({
      email,
      results,
    });
    // console.log(session);
    await session.save();
    res.status(201).json({ message: "Session saved successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save session." });
  }
});


app.get('/sessions', async (req, res) => {
    try {
        const sessions = await Session.find({ email: "abcd@gmail.com" });
        console.log("request came ");
        res.json({ sessions });
    } catch (err) {
        // console.error('JWT verification error:', err);
        res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
});

app.listen(3001, () => {
    console.log("Server listining on localhost - :3001");
});