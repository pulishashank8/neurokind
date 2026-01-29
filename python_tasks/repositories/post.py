
from .base import BaseRepository
from orm_models import Post as PostORM

class PostRepository(BaseRepository[PostORM]):
    model_class = PostORM
    
    # Add any post-specific query methods here
    pass
