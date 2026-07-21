from pydantic import BaseModel


class CurrentUser(BaseModel):
    id: int
    email: str
    role: str
    enabled: bool