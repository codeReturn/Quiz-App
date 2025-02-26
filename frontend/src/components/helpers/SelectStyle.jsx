export const customStyles = {
  control: (base, state) => ({
    ...base,
    background: "rgba(0,0,0,0.05)",
    borderRadius: 5,
    borderColor: state.isFocused ? "#0d6efd" : "#0d6efd",
    boxShadow: state.isFocused ? null : null,
    color: "white", 
    "&:hover": {
      borderColor: "#0d6efd",
      background: "rgba(0,0,0,0.05)",
      color: "white",
    },
  }),
  input: (base) => ({
    ...base,
    color: "white", 
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgba(255, 255, 255, 0.7)", 
  }),
  singleValue: (base) => ({
    ...base,
    color: "white", 
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? "rgba(0,0,0,0.2)" : "#0d6efd",
    color: "white",
    "&:hover": {
      background: "rgba(0,0,0,0.3)",
      color: "white",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 0,
    marginTop: 0,
  }),
  menuList: (base) => ({
    ...base,
    background: "#0d6efd",
    padding: "0.25rem",
  }),
};
