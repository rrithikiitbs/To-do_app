const { useState, useEffect } = React;

function App() {
  const [page, setPage] = useState("welcome"); // welcome | tasks | completed
  const [tasks, setTasks] = useState([]);
  const [score, setScore] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [urgentTask, setUrgentTask] = useState(null);


  // 🕒 Track overdue tasks every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTasks(tasks =>
        tasks.map(task => {
          if (
            task.deadline &&
            !task.completed &&
            new Date(task.deadline) < new Date()
          ) {
            return { ...task, overdue: true };
          }
          return task;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /*2 hours deadline pop up*/ 

  useEffect(() => {
  if (page === "tasks") {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    const urgent = tasks.find(
      t => !t.completed && t.deadline && new Date(t.deadline) <= twoHoursLater
    );

    if (urgent) {
      setUrgentTask(urgent); // show popup
    }
  }
}, [page, tasks]);


  // ➕ Add new task
  const addTask = e => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: newTask.trim(),
        deadline: newDeadline ? newDeadline : null,
        completed: false,
        overdue: false,
        completedAt: null, // store completion time
      },
    ]);
    setNewTask("");
    setNewDeadline("");
  };
  // ❌ Remove a task from the task page
const removeTask = (id) => {
  setTasks(tasks.filter(task => task.id !== id));
};


  // ✅ Toggle complete/uncomplete
  const toggleComplete = id => {
    setTasks(tasks =>
      tasks.map(task => {
        if (task.id === id) {
          const updated = {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : null, // save/clear time
          };

          // Adjust score
          if (updated.completed) {
            setScore(s => s + 1 / (tasks.length || 1));
          } else {
            setScore(s => Math.max(0, s - 1 / (tasks.length || 1)));
          }

          return updated;
        }
        return task;
      })
    );
  };

  // 📋 Sort tasks by deadline
  const sortedTasks = [...tasks].sort((a, b) => {
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const aUrgent = a.deadline && !a.completed && new Date(a.deadline) <= twoHoursLater;
  const bUrgent = b.deadline && !b.completed && new Date(b.deadline) <= twoHoursLater;

  if (aUrgent && !bUrgent) return -1; // urgent first
  if (!aUrgent && bUrgent) return 1;
  
  // fallback to regular sorting: nearest deadline first
  if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
  if (a.deadline) return -1;
  if (b.deadline) return 1;
  return 0;
  });

  // Split active vs completed
  const activeTasks = sortedTasks.filter(t => !t.completed);
  const completedTasks = tasks
    .filter(t => t.completed)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)); // recent first

  // ------------------------
  // 🟢 Welcome Page
  // ------------------------
  if (page === "welcome") {
    <div className="stairs-animation">
    <div className="man"></div>
    <div className="stairs"></div>
    </div>

    return (
      <div className="welcome">
        <h1>You can do it 💪</h1>
        <button onClick={() => setPage("tasks")}>What to Conquer?</button>
      </div>
    );
  }

  // ------------------------
  // 🟢 Tasks Page
  // ------------------------
  if (page === "tasks") {
    return (
      <div className="app">
        {/* Back button to Welcome */}
        <button className="back-btn" onClick={() => setPage("welcome")}>
          ⬅ Back
        </button>

        <div className="header">
          <h2>Tasks to Achieve</h2>
          <span>Score: {score.toFixed(2)}</span>
        </div>
        {urgentTask && (
            <div className="urgent-popup"> <p>🔥 Urgent Task: {urgentTask.title} is due soon!</p>
            <button onClick={() => setUrgentTask(null)}>Close</button>
            </div>
        )}

        {/* Active Tasks */}
        <div className="task-columns">
          <div>
            <h3>Tasks</h3>
            {activeTasks.map(task => (
              <div
                key={task.id}
                className={`task-row ${task.overdue ? "overdue" : ""}`}
              >
                {task.overdue ? (
                  <span>😢</span>
                ) : (
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                  />
                )}
                <span className="task-title">
                    {task.title} {task.deadline && new Date(task.deadline) <= new Date(Date.now() + 2*60*60*1000) ? "🔥" : ""}
                </span>
                {/* ❌ Cross button to remove task */}
                <button
                className="remove-btn"
                onClick={() => removeTask(task.id)}> ✖ </button>
              </div>
            ))}
          </div>

          <div>
            <h3>Deadlines</h3>
            {activeTasks.map(task => (
              <div key={task.id} className="task-row">
                {task.deadline ? (
                  <span>{new Date(task.deadline).toLocaleString()}</span>
                ) : (
                  <span>—</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add New Task */}
        <form onSubmit={addTask} className="task-form">
          <input
            type="text"
            placeholder="Task title"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
          />
          <input
            type="datetime-local"
            value={newDeadline}
            onChange={e => setNewDeadline(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>

        {/* Button to Completed Page */}
        <button className="completed-btn" onClick={() => setPage("completed")}>
          ✅ View Completed Tasks
        </button>
      </div>
    );
  }

  // ------------------------
  // 🟢 Completed Page
  // ------------------------
  if (page === "completed") {
    return (
      <div className="completed-page">
        <h2>🎉 Completed Tasks</h2>
        {completedTasks.length === 0 ? (
          <p>No items yet</p>
        ) : (
          <ul>
            {completedTasks.map(task => (
              <li key={task.id}>
                <span className="task-title">{task.title}</span>
                <br />
                <small>
                  Completed at:{" "}
                  {task.completedAt
                    ? new Date(task.completedAt).toLocaleString()
                    : "—"}
                </small>
              </li>
            ))}
          </ul>
        )}

        {/* Clear + Back Buttons */}
        {completedTasks.length > 0 && (
            <><button className="clear-btn" onClick={() => setShowConfirm(true)}>
                    🗑 Clear All
                </button>
                </>
        )}
        <button className="back-btn" onClick={() => setPage("tasks")}>
          ⬅ Back to Tasks
        </button>

        {showConfirm && (
            <div className="confirm-popup">
                <p>Are you sure you want to clear all completed tasks?</p>
                <button onClick={() => {
                    setTasks(tasks.filter(t => !t.completed)); // only remove completed tasks
                    setShowConfirm(false); // hide popup
                    }}>
                    Yes, Clear
                    </button>
                    <button onClick={() => setShowConfirm(false)}>Cancel</button>
                    </div>
                )
        }
      </div>
    );
  }
}


// Render App
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
