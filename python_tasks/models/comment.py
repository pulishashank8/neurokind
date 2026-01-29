from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from .enums import CommentStatus

class Comment(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Unique identifier for the comment (CUID)")
    content: str = Field(..., description="Content of the comment")
    author_id: str = Field(..., alias="authorId", description="ID of the author (User)")
    post_id: str = Field(..., alias="postId", description="ID of the post")
    parent_comment_id: Optional[str] = Field(None, alias="parentCommentId", description="ID of the parent comment if this is a reply")
    
    status: CommentStatus = Field(CommentStatus.ACTIVE, description="Current status of the comment")
    is_anonymous: bool = Field(False, alias="isAnonymous", description="Whether the comment is anonymous")
    vote_score: int = Field(0, alias="voteScore", description="Net vote score")
    
    created_at: datetime = Field(..., alias="createdAt", description="Record creation timestamp")
    updated_at: datetime = Field(..., alias="updatedAt", description="Record last update timestamp")
