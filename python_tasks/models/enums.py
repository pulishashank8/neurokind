from enum import Enum

class Role(str, Enum):
    PARENT = "PARENT"
    THERAPIST = "THERAPIST"
    MODERATOR = "MODERATOR"
    ADMIN = "ADMIN"

class PostStatus(str, Enum):
    ACTIVE = "ACTIVE"
    REMOVED = "REMOVED"
    LOCKED = "LOCKED"
    PINNED = "PINNED"
    DRAFT = "DRAFT"

class CommentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    REMOVED = "REMOVED"
    HIDDEN = "HIDDEN"
