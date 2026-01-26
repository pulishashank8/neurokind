'use client';

import { useState } from 'react';
import { Ban, ShieldCheck, StickyNote, Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

interface Note {
  id: string;
  note: string;
  createdAt: Date | string;
}

interface UserActionsProps {
  userId: string;
  isBanned: boolean;
  bannedReason: string | null;
  initialNotes: Note[];
}

export default function UserActions({ userId, isBanned, bannedReason, initialNotes }: UserActionsProps) {
  const [banned, setBanned] = useState(isBanned);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleBan() {
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: banReason }),
      });
      if (res.ok) {
        setBanned(true);
        setShowBanModal(false);
        setBanReason('');
      }
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnban() {
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/users/${userId}/ban`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBanned(false);
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/users/${userId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes([data.note, ...notes]);
        setNewNote('');
        setShowNoteModal(false);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    try {
      const res = await fetch(`/api/owner/users/${userId}/notes?noteId=${noteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

  return (
    <>
      <div className="flex gap-3 mb-6">
        {banned ? (
          <button
            onClick={handleUnban}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            <ShieldCheck size={16} />
            Unban User
          </button>
        ) : (
          <button
            onClick={() => setShowBanModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <Ban size={16} />
            Ban User
          </button>
        )}
        <button
          onClick={() => setShowNoteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={16} />
          Add Note
        </button>
      </div>

      {notes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <StickyNote className="text-yellow-600" size={20} />
            <h3 className="font-semibold text-gray-800">Owner Notes</h3>
          </div>
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-white p-3 rounded-lg border border-yellow-100">
                <div className="flex items-start justify-between">
                  <p className="text-gray-700">{note.note}</p>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showBanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Ban User</h3>
              <button onClick={() => setShowBanModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              This will prevent the user from logging in and accessing the platform.
            </p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for ban (optional)"
              className="w-full p-3 border rounded-lg mb-4 resize-none"
              rows={3}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBanModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? 'Banning...' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add Note</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Add a private note about this user. Only you can see these notes.
            </p>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note here..."
              className="w-full p-3 border rounded-lg mb-4 resize-none"
              rows={4}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={loading || !newNote.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
