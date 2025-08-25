import express from 'express';
import cors from 'cors';

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173'],
};
app.use(cors(corsOptions));

// Middleware สำหรับ JSON และ form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// เก็บข้อมูลชั่วคราวในหน่วยความจำ
let notes = [];

// Route 1: GET /
app.get('/', (req, res, next) => {
  try {
    res
      .status(200)
      .send('Hello, this is an Express API server for a Notes App build with React.');
  } catch (err) {
    next(err);
  }
});

// Route 2: POST /notes (create)
app.post('/notes', (req, res, next) => {
  try {
    const { title, content, tags = [] } = req.body;

    const newNote = {
      id: String(notes.length + 1),
      title,
      content,
      tags,
    };

    notes.push(newNote);
    res.status(201).json(newNote);
  } catch (err) {
    next(err);
  }
});

// Route 3: GET /notes (read all)
app.get('/notes', (req, res) => {
  res.status(200).json(notes);
});

// Route 4: DELETE /notes/:id (delete one)
app.delete('/notes/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const index = notes.findIndex((note) => note.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'note not found' });
    }

    const deleted = notes.splice(index, 1);

    res.status(200).json({
      message: `Note with ID ${id} deleted successfully`,
      deleted: deleted[0],
      notes,
    });
  } catch (err) {
    next(err);
  }
});

// Route 5: PATCH /notes/:id (partial update)
app.patch('/notes/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const index = notes.findIndex((m) => m.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'note not found' });
    }

    // ไม่อนุญาตให้แก้ id
    if ('id' in req.body && String(req.body.id) !== id) {
      return res.status(400).json({ message: "Changing 'id' is not allowed" });
    }

    // อนุญาตเฉพาะ field เหล่านี้
    const allowed = ['title', 'content', 'tags'];
    const patchData = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patchData[k] = req.body[k];
    }

    notes[index] = { ...notes[index], ...patchData };

    res.status(200).json({
      message: 'Note updated successfully',
      patch: notes[index],
    });
  } catch (err) {
    next(err);
  }
});

// Route 6: DELETE /notes (delete all)
app.delete('/notes', (req, res) => {
  notes.splice(0, notes.length);
  res.status(200).json({ message: 'All notes deleted', notes });
});

// Route 7: PUT /notes/:id (full replace/update)
app.put('/notes/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, tag = [] } = req.body; // รับชื่อ 'tag' แล้ว map ไปที่ 'tags'
  const note = notes.find((n) => n.id === id);

  if (note) {
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tag !== undefined) note.tags = tag;

    return res.status(200).send(`Note with ID ${id} updated`);
  }

  res.status(404).send('Note not found.');
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅ 👂`);
});
