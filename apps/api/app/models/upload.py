from pydantic import BaseModel


class UploadResponse(BaseModel):
    url: str
    path: str


class ErrorResponse(BaseModel):
    detail: str
