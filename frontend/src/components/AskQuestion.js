import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Emoji from '@tiptap/extension-emoji';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField as MuiTextField } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import ImageIcon from '@mui/icons-material/Image';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

const AskQuestion = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image,
      Emoji
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, content: editor.getHTML() }));
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !editor || editor.isEmpty) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await axios.post('http://localhost:5000/api/questions', {
        title: formData.title,
        content: formData.content,
        tags
      });

      navigate(`/question/${response.data.id}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Ask a Question
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Share your knowledge and help others learn. Be specific and clear in your question.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Question Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
            helperText="Be specific and imagine you're asking another person"
            autoFocus
          />

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Question Details *
            </Typography>
            {/* Toolbar */}
            {editor && (
              <Box sx={{ display: 'flex', gap: 1, mb: 1, background: '#f5f5f5', borderRadius: 1, p: 1, flexWrap: 'wrap' }}>
                <Tooltip title="Bold"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'default'}><FormatBoldIcon /></IconButton></span></Tooltip>
                <Tooltip title="Italic"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'default'}><FormatItalicIcon /></IconButton></span></Tooltip>
                <Tooltip title="Bullet List"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? 'primary' : 'default'}><FormatListBulletedIcon /></IconButton></span></Tooltip>
                <Tooltip title="Numbered List"><span><IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} color={editor.isActive('orderedList') ? 'primary' : 'default'}><FormatListNumberedIcon /></IconButton></span></Tooltip>
                <Tooltip title="Align Left"><span><IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('left').run()} color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}><FormatAlignLeftIcon /></IconButton></span></Tooltip>
                <Tooltip title="Align Center"><span><IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('center').run()} color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}><FormatAlignCenterIcon /></IconButton></span></Tooltip>
                <Tooltip title="Align Right"><span><IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('right').run()} color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}><FormatAlignRightIcon /></IconButton></span></Tooltip>
                <Tooltip title="Insert Link"><span><IconButton size="small" onClick={() => {
                  const url = window.prompt('Enter the URL');
                  if (url) editor.chain().focus().setLink({ href: url }).run();
                }} color={editor.isActive('link') ? 'primary' : 'default'}><InsertLinkIcon /></IconButton></span></Tooltip>
                <Tooltip title="Insert Image"><span><IconButton size="small" onClick={() => setImageDialogOpen(true)}><ImageIcon /></IconButton></span></Tooltip>
                <Tooltip title="Insert Emoji"><span><IconButton size="small" onClick={() => {
                  const emoji = window.prompt('Enter emoji (e.g. 😀)');
                  if (emoji) editor.chain().focus().insertContent(emoji).run();
                }}><EmojiEmotionsIcon /></IconButton></span></Tooltip>
                <Tooltip title="Undo"><span><IconButton size="small" onClick={() => editor.chain().focus().undo().run()}><UndoIcon /></IconButton></span></Tooltip>
                <Tooltip title="Redo"><span><IconButton size="small" onClick={() => editor.chain().focus().redo().run()}><RedoIcon /></IconButton></span></Tooltip>
              </Box>
            )}
            {/* Image Dialog */}
            <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)}>
              <DialogTitle>Insert Image</DialogTitle>
              <DialogContent>
                <MuiTextField
                  autoFocus
                  margin="dense"
                  label="Image URL"
                  type="url"
                  fullWidth
                  variant="standard"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setImageDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  if (imageUrl) editor.chain().focus().setImage({ src: imageUrl }).run();
                  setImageDialogOpen(false);
                  setImageUrl('');
                }}>Insert</Button>
              </DialogActions>
            </Dialog>
            <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, background: '#fff' }}>
              <EditorContent editor={editor} style={{ minHeight: 150 }} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Include all the information someone would need to answer your question
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            margin="normal"
            helperText="Add up to 5 tags to help categorize your question (e.g., javascript, react, nodejs)"
          />

          {/* Preview tags */}
          {formData.tags && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0)
                .map((tag, index) => (
                  <Chip key={index} label={tag} size="small" />
                ))}
            </Box>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? 'Posting Question...' : 'Post Question'}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AskQuestion; 