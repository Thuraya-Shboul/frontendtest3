import { useEffect, useState } from "react";
import axios from "axios";



function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null);
  const [auth, setAuth] = useState({ email: "", password: "" });
  const [loggedIn, setLoggedIn] = useState(false);


  axios.defaults.baseURL = import.meta.env.VITE_DOMAIN;

  // Attach token automatically
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = token;
    return config;
  });


  const fetchStudents = async () => {
    try {
      const res = await axios.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setLoggedIn(true);
      fetchStudents();
    }
  }, []);
  const login = async () => {
    try {
      const res = await axios.post("/login", auth);
      localStorage.setItem("token", res.data.token);
      setLoggedIn(true);
      fetchStudents();
    } catch (err) {
      alert(err.response.data.error);
    }
  };
  const register = async () => {
    if (!auth.email || !auth.password) {
      alert("Email and password required");
      return;
    }
    try {
      await axios.post("/register", auth);
      alert("Registered! Now you can login.");
    } catch (err) {
      alert(err.response.data.error);
    }
  };
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      alert("Name and email cannot be empty");
      return;
    }
    try {
      if (editingId) {
        const res = await axios.put(`/students/${editingId}`, form);
        setStudents(students.map((s) => (s._id === editingId ? res.data : s)));
        setEditingId(null);
      } else {
        const res = await axios.post("/students", form);
        setStudents([...students, res.data]);
      }
      setForm({ name: "", email: "" });
    } catch (err) {
      console.error(err);
    }
  };
  const editStudent = (student) => {
    setForm({ name: student.name, email: student.email });
    setEditingId(student._id);
  };
  const deleteStudent = async (id) => {
    try {
      await axios.delete(`/students/${id}`);
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };
  // ---------------- AUTH UI ----------------
  if (!loggedIn)
    return (
      <div style={{ margin: "50px" }}>
        <h2>Login / Register</h2>
        <input
          placeholder="Email"
          value={auth.email}
          onChange={(e) => setAuth({ ...auth, email: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          value={auth.password}
          onChange={(e) => setAuth({ ...auth, password: e.target.value })}
        />
        <button onClick={login}>Login</button>
        <button onClick={register}>Register</button>
      </div>
    );
  // ---------------- STUDENT UI ----------------
  return (
    <div style={{ margin: "50px" }}>
      <h2>Student Manager (Your Data Only)</h2>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          setLoggedIn(false);
        }}
      >
        Logout
      </button>
      <br /><br />
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <button onClick={handleSubmit}>
        {editingId ? "Update" : "Add"}
      </button>
      <ul>
        {students.map((s) => (
          <li key={s._id}>
            {s.name} ({s.email})
            <button onClick={() => editStudent(s)}>Edit</button>
            <button onClick={() => deleteStudent(s._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;