from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.schemas.retrieval import RagQueryPlan
from app.prompts.rag_prompt import QUERY_PLANNER_PROMPT


class RagQueryPlanner:
    def __init__(self, model: ChatOpenAI | None = None) -> None:
        base_model = model or ChatOpenAI(
            api_key=settings.openai_api_key.get_secret_value(),
            model=settings.openai_chat_model,
            temperature=0,
        )

        self.model = base_model.with_structured_output(RagQueryPlan)

    async def plan(self, question: str) -> RagQueryPlan:
        result = await self.model.ainvoke(
            [
                SystemMessage(content=QUERY_PLANNER_PROMPT),
                HumanMessage(content=question),
            ]
        )

        if result.in_scope and not result.search_query.strip():
            return RagQueryPlan(
                in_scope=True,
                search_query=question.strip(),
            )

        return result


rag_query_planner = RagQueryPlanner()