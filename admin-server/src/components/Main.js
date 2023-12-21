import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'

function LoginPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    function handleLogin() {
        setShowMessage(true);
        // Call the authorize function with the provided userId and password
        if (authorize(userId, password)) {
            setIsAuthorized(true);
            console.log("Authorization successful");
            navigate('/dashboard')
        } else {
            setIsAuthorized(false);
            console.log("Authorization failed");
        }
    }

    return (
        <div>
            <h1>Login Page</h1>
            <input
                type="text"
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            
            {showMessage && isAuthorized && <p>Authorization successful</p>}
            {showMessage && !isAuthorized && <p>Authorization failed</p>}
        </div>
    );
}

// Define a function for custom authorization
function authorize(userId, password) {
    // Check if the provided userId and password match the expected values
    if (userId === "admin" && password === "password") {
        // Authorization successful
        return true;
    } else {
        // Authorization failed
        return false;
    }
}

export default LoginPage;
