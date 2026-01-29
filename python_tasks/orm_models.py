
from sqlalchemy import Column, String, Integer, DateTime, Boolean, DECIMAL, Text, JSON
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "User"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    hashedPassword = Column("hashedPassword", String, nullable=True)
    emailVerified = Column("emailVerified", Boolean, default=False)
    emailVerifiedAt = Column("emailVerifiedAt", DateTime, nullable=True)
    createdAt = Column("createdAt", DateTime, server_default=func.now())
    updatedAt = Column("updatedAt", DateTime, onupdate=func.now())
    lastLoginAt = Column("lastLoginAt", DateTime, nullable=True)
    isBanned = Column("isBanned", Boolean, default=False)
    bannedAt = Column("bannedAt", DateTime, nullable=True)
    bannedReason = Column("bannedReason", Text, nullable=True)

class Post(Base):
    __tablename__ = "Post"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    authorId = Column("authorId", String, nullable=True)
    categoryId = Column("categoryId", String, nullable=False)
    status = Column(String, default='ACTIVE') 
    viewCount = Column("viewCount", Integer, default=0)
    commentCount = Column("commentCount", Integer, default=0)
    voteScore = Column("voteScore", Integer, default=0)
    createdAt = Column("createdAt", DateTime, server_default=func.now())
    updatedAt = Column("updatedAt", DateTime, onupdate=func.now())

class Comment(Base):
    __tablename__ = "Comment"
    
    id = Column(String, primary_key=True)
    content = Column(Text, nullable=False)
    authorId = Column("authorId", String, nullable=False)
    postId = Column("postId", String, nullable=False)
    voteScore = Column("voteScore", Integer, default=0)
    createdAt = Column("createdAt", DateTime, server_default=func.now())

class Notification(Base):
    __tablename__ = "Notification"
    
    id = Column(String, primary_key=True)
    userId = Column("userId", String, nullable=False)
    type = Column(String, nullable=False)
    payload = Column(JSON, nullable=False)
    readAt = Column("readAt", DateTime, nullable=True)
    createdAt = Column("createdAt", DateTime, server_default=func.now())
