import React from "react";

const FormInput = ({ id, name, type = "text", value, onChange, placeholder }) => {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="peer w-full px-4 pt-6 pb-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-transparent transition-all"
        required
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-2 text-sm text-gray-400 transition-all duration-200 
                   peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
                   peer-focus:top-2 peer-focus:text-sm peer-focus:text-sky-400"
      >
        {placeholder}
      </label>
    </div>
  );
};

export default FormInput;