from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from .enums import PostStatus

class Post(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Unique identifier for the post (CUID)")
    title: str = Field(..., min_length=1, max_length=255, description="Title of the post")
    content: str = Field(..., description="Content of the post")
    author_id: Optional[str] = Field(None, alias="authorId", description="ID of the author (User)")
    is_anonymous: bool = Field(False, alias="isAnonymous", description="Whether the post is anonymous")
    category_id: str = Field(..., alias="categoryId", description="ID of the category")
    status: PostStatus = Field(PostStatus.ACTIVE, description="Current status of the post")
    
    view_count: int = Field(0, alias="viewCount", description="Number of views")
    comment_count: int = Field(0, alias="commentCount", description="Number of comments")
    vote_score: int = Field(0, alias="voteScore", description="Net vote score")
    
    is_pinned: bool = Field(False, alias="isPinned", description="Whether the post is pinned")
    is_locked: bool = Field(False, alias="isLocked", description="Whether the post is locked")
    pinned_at: Optional[datetime] = Field(None, alias="pinnedAt", description="Timestamp when the post was pinned")
    
    created_at: datetime = Field(..., alias="createdAt", description="Record creation timestamp")
    updated_at: datetime = Field(..., alias="updatedAt", description="Record last update timestamp")
