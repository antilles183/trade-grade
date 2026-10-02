from typing import Literal

from pydantic import BaseModel, Field, model_validator

Position = Literal["QB", "RB", "WR", "TE", "K", "D/ST"]


class Player(BaseModel):
    id: int
    name: str
    position: Position
    pro_team: str
    percent_owned: float = 0.0


class TradeRequest(BaseModel):
    giving: list[int] = Field(min_length=1)
    receiving: list[int] = Field(min_length=1)
    my_roster: list[int] = []
    their_roster: list[int] = []
    league_format: str | None = Field(default=None, max_length=200)

    @model_validator(mode="after")
    def no_overlap(self) -> "TradeRequest":
        overlap = set(self.giving) & set(self.receiving)
        if overlap:
            raise ValueError(f"Players cannot be on both sides of the trade: {sorted(overlap)}")
        return self


class TradeAnalysis(BaseModel):
    grade: Literal["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"]
    verdict: Literal["accept", "reject", "counter"]
    summary: str
    giving_analysis: str
    receiving_analysis: str
    roster_impact: str | None = None
    suggested_counter: str | None = None
