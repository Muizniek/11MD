import { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

interface IData {
  id: number;
  toDo: string;
}

function App() {
  const [toDo, settoDo] = useState<string>("");
  const [data, setData] = useState<IData[]>([]);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get<IData[]>("http://localhost:3001/data");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const validateForm = (): boolean => {
    return !!toDo;
  };

  const addData = async () => {
    try {
      if (!validateForm()) {
        console.error("Please fill in all fields");
        return;
      }

      if (editingUserId !== null) {
        // If editing, perform update
        await axios.put(`http://localhost:3001/data/${editingUserId}`, {
          toDo
        });
        setEditingUserId(null); // Reset editing state
      } else {
        // If not editing, perform add
        const newData: IData = { toDo } as IData;
        await axios.post("http://localhost:3001/data", newData);
      }

      fetchData();
      // Clear form fields after submission
      settoDo("");
    } catch (error) {
      console.error("Error adding/updating data:", error);
    }
  };

  const deleteData = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/data/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const editData = (id: number) => {
    // Set editing mode and populate form fields with user data
    const userToEdit = data.find((item) => item.id === id);
    if (userToEdit) {
      setEditingUserId(id);
      settoDo(userToEdit.toDo);
    }
  };

  return (
    <>
      <div className="App">
        <div className="input-container">
          <label htmlFor="toDo">What to do:</label>
          <input type="text" value={toDo} onChange={(event) => settoDo(event.target.value)} />
          <button onClick={addData}>{editingUserId !== null ? "Update" : "Add task"}</button>
        </div>
      </div>

      <div className='output-wrapper'>
        <h1 className="h1">List of To Does</h1>
        <div className="card-container">
          {data.map((item) => (
            <div className="card" key={item.id}>
              <div>
                <strong>Task:</strong> {item.toDo}
              </div>
              <div className="button-wrapper">
                <button onClick={() => editData(item.id)} id="edit-button">Edit</button>
                <button onClick={() => deleteData(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
