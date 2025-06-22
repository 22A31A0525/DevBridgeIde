import React from "react";
import FormInput from "./FormInput";


const AuthForm = ({ mode, form, handleChange, handleSubmit, loading, toggleMode }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        id="username"
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
      />

      {mode === "register" && (
        <FormInput
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
      )}

      <FormInput
        id="password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Please wait..." : mode === "login" ? "Log In" : "Register"}
      </button>

      <p className="text-center mt-6 text-sm text-gray-300">
        {mode === "login" ? "Don't have an account?" : "Already have an account?"} {" "}
        <button onClick={toggleMode} type="button" className="text-sky-400 underline hover:text-sky-300">
          {mode === "login" ? "Register" : "Login"}
        </button>
      </p>
    </form>
  );
};

export default AuthForm;
