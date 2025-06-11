import React, { useState } from 'react';
import bgImage from '../../assets/ubc_image.png?url';
import Navbar from '../../components/layout/login_navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import gradCap from '../../assets/grad-cap-blue.png';
import type User from '../../interfaces/user/User';



const InputField = ({ label, name, type, value, onChange, ...rest }: any) => (
  <div>
    <label htmlFor={name} className="text-sm block mb-1">{label}*</label>
    <input
      id={name} 
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-400 rounded px-3 py-2"
      required
      {...rest}
    />
  </div>
);


const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
   
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
  });

  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    return true;
  };

 const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    const response = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        userType: formData.role
      })
    });

    if (!response.ok) {
      const error = await response.text();
     if (error.includes("An account with this email already exists")) {
  alert("Email already exists. Please use a different email.");
      } else {
        alert("Signup failed. Check the form or try again.");
      }

      console.error("Signup failed:", error);
      return;
    }

    const user: User = await response.json();
    console.log("Signup success. User:", user);

    alert("Signup successful! Redirecting to login...");
    navigate("/login");

  } catch (err) {
    console.error("Signup error:", err);
    alert("Server error. Please try again later.");
  }
};


  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <img src={bgImage} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white opacity-50" />
      </div>

      <Navbar />

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 mb-10">
        <div className="w-full max-w-2xl bg-white bg-opacity-90 p-6 sm:p-8 rounded-2xl shadow-lg">
          <div className="text-center mb-1">
            <img src={gradCap} alt="TA Portal Logo" className="w-50 h-35 mx-auto mb-0" />
            <p className="-mt-8 mb-8 text-gray-600">Efficient TA Allocation Made Easy</p>
          </div>

          <h3 className="text-md font-semibold text-center mb-4">Create an Account</h3>

          <form onSubmit={handleSignUp} className="space-y-4">
            <InputField label="First Name" name="firstName" type="text" value={formData.firstName} onChange={handleChange} />
             <InputField label="Last Name" name="lastName" type="text" value={formData.lastName} onChange={handleChange} />
            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" />

            <div>
             <label htmlFor="role" className="text-sm block mb-1">Role*</label>
                  <select
                    id="role" 
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-400 rounded px-3 py-2"
                  >

                <option value="">Select Role</option>
               <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="COORDINATOR">TA Coordinator</option>

              </select>
            </div>

            <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} pattern="^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-\[\]{}|;:',.<>?]).{8,}$" />
            <InputField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />

            {formData.confirmPassword && formData.confirmPassword !== formData.password && (
              <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
            )}

            <p className="text-base text-left text-black mt-2">
              Already have an account?{" "}
              <a href="/login" className="text-sm text-[#040491] hover:opacity-50 transition-opacity" style={{color:"#040941"}}>Login Here</a>
            </p>

            <button type="submit" className="w-full bg-[#040941] text-white py-2 rounded hover:bg-[#040491] transition-colors">
              Signup
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
