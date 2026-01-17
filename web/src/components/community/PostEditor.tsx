"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema, CreatePostInput } from "@/lib/validations/community";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface PostEditorProps {
  categories: Category[];
  tags: Tag[];
  onSuccess?: (postId: string) => void;
}

export function PostEditor({
  categories,
  tags,
  onSuccess,
}: PostEditorProps) {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      isAnonymous: false,
      tags: [],
    },
    mode: "onChange",
  });

  const content = watch("content");
  const title = watch("title");

  const onSubmit = async (data: CreatePostInput) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          isAnonymous,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }

      const result = await response.json();
      toast.success("Post created successfully!");
      reset();
      setSelectedTags([]);
      onSuccess?.(result.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId].slice(0, 5)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
          Post Title
        </label>
        <input
          type="text"
          placeholder="What would you like to discuss?"
          className="w-full px-4 py-3 sm:py-4 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[48px]"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-[var(--danger)] mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
          Category
        </label>
        <select
          className="w-full px-4 py-3 sm:py-4 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[48px]"
          {...register("categoryId")}
        >
          <option value="">Select a category...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-xs text-[var(--danger)] mt-1">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
            Tags (up to 5)
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedTags.includes(tag.id)
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-hover)]"
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-[var(--text-primary)]">
            Content
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs font-medium text-[var(--primary)] hover:underline"
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>

        {showPreview ? (
          <div className="min-h-[200px] p-4 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-[var(--radius-md)] prose prose-sm dark:prose-invert max-w-none">
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap break-words">
              {content || "Your preview will appear here..."}
            </p>
          </div>
        ) : (
          <textarea
            placeholder="Share your thoughts, tips, or questions. (Markdown supported)"
            className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none min-h-[200px] font-mono text-sm"
            {...register("content")}
          />
        )}

        {errors.content && (
          <p className="text-xs text-[var(--danger)] mt-1">{errors.content.message}</p>
        )}
        <p className="text-xs text-[var(--text-muted)] mt-2">
          {content.length} / 50,000 characters
        </p>
      </div>

      {/* Anonymous Toggle */}
      <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-4 border border-[var(--border-light)]">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-5 h-5 rounded accent-[var(--primary)]"
          />
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Post anonymously
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Your username will not be visible. This is helpful for sensitive topics.
            </p>
          </div>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !isValid}
        className="w-full min-h-[48px] px-6 rounded-[var(--radius-md)] bg-[var(--primary)] text-white hover:opacity-90 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
