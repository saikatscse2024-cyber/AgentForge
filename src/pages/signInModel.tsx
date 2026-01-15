import React from "react";
import { signInWithGooglePopup } from "../../utils/Firebase/firebase";

export default function SignIn() {
    const logGoogleUser = async () => {
        const response = signInWithGooglePopup();
        console.log(response);
    };

    return (
        <div>
            <h1>Sign In Page</h1> 
            <button onClick={logGoogleUser}>Sign in with Google Popup</button> 
        </div>
    ); 
}