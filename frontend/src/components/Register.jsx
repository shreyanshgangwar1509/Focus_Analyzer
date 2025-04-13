import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        axios.post('http://localhost:3001/register', { name, email, password })
            .then(result => {
                console.log(result);
                if (result.data === "Already registered") {
                    alert("E-mail already registered! Please Login to proceed.");
                    navigate('/login');
                } else {
                    alert("Registered successfully! Please Login to proceed.");
                    navigate('/login');
                }
            })
            .catch(err => console.log(err));
    }

    return (
        <div className="d-flex justify-content-center align-items-center text-center vh-100"
             style={{ backgroundImage: "linear-gradient(to right, #0d6efd, #0b5ed7, #0a58ca)" }}>
            <div className="bg-white p-4 rounded shadow" style={{ width: '400px' }}>
                <h2 className="mb-4 text-primary fw-bold">Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3 text-start">
                        <label className="form-label fw-semibold">Name</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            className="form-control"
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3 text-start">
                        <label className="form-label fw-semibold">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="form-control"
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3 text-start">
                        <label className="form-label fw-semibold">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="form-control"
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mb-2">
                        Register
                    </button>
                </form>
                <p className="my-2 text-muted">Already have an account?</p>
                <Link to="/login" className="btn btn-outline-primary w-100">
                    Login
                </Link>
            </div>
        </div>
    );
}

export default Register;
