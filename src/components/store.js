import { create } from "zustand";
import { collection, getDocs, addDoc, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../server';

const store = (set, get) => ({
  input: '',
  taskName: '',
  tasks: [],
  filter: 'All',
  
  // Setters
  setInput: (input) => set({ input }),
  setTaskName: (taskName) => set({ taskName }),
  setTasks: (tasks) => set({ tasks }),
  setFilter: (filter) => set({ filter }),

  // Create new task
  createNewTask: (taskName) => ({
    task: taskName,
    completed: false,
  }),

  // Handle checkbox toggle (task completion)
  handleData: (task) => {
    const updatedTask = { ...task, completed: !task.completed };
    get().updateTask(task.id, updatedTask);
  },

  // Filter tasks
  handleTasks: (filter) => set({ filter }),

  // Handle input change
  handleChange: (e) => {
    const inputValue = e.target.value;
    get().setInput(inputValue);
  },

  // Handle input submit
  handleInput: () => {
    const { input } = get();
    get().setTaskName(input);
    get().setInput('');
  },

  // Fetch tasks from Firestore
  fetchTasks: async () => {
    try {
      const response = await getDocs(collection(db, 'tasks'));
      const tasks = response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ tasks });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  },

  // Post a new task to Firestore
  postData: async (taskName) => {
    try {
      if (taskName) {
        const newTask = get().createNewTask(taskName);
        await addDoc(collection(db, 'tasks'), newTask);
        await get().fetchTasks();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  },

  // Update a task in Firestore
  updateTask: async (id, updatedTask) => {
    try {
      const taskRef = doc(db, 'tasks', id);
      await setDoc(taskRef, updatedTask, { merge: true });
      await get().fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  },

  // Delete completed tasks from Firestore
  clearCompleted: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      const tasksToDelete = querySnapshot.docs.filter(doc => doc.data().completed);
      // Delete the completed tasks
      tasksToDelete.forEach(async (taskDoc) => {
        await deleteDoc(doc(db, 'tasks', taskDoc.id));
      });
      await get().fetchTasks();
    } catch (error) {
      console.error('Error deleting completed tasks:', error);
    }
  }
});

export const useStore = create(store);
