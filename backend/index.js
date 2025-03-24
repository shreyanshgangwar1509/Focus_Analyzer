import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import User from './models/User.model.js';

const app = express();
app.use(express.json());
app.use(cors());

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

app.post('/login',async (req, res)=>{
    // To find record from the database
    const {email, password} = req.body;
    await User.findOne({email: email})
    .then(user => {
        if(user){
            // If user found then these 2 cases
            if(user.password === password) {
                res.json("Success");
            }
            else{
                res.json("Wrong password");
            }
        }
        // If user not found then 
        else{
            res.json("No records found! ");
        }
    })
})

app.listen(3001, () => {
    console.log("Server listining on http://127.0.0.1:3001");
});