from .models import ChatHistory
from .serializers import ChatHistorySerializer
import json
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain import hub
import os
from langchain.agents import AgentExecutor, create_openai_tools_agent
from django.db.models import Q
from collections import defaultdict

prompt = hub.pull("hwchase17/openai-tools-agent")

class DocumentHandler():
    retrieved_documents = defaultdict(list)

document_handler = DocumentHandler()

def convert_to_history(data):
    chat_history = []
    for message in data:
        #print(message)
        if message["user_role"] == "user":
            chat_history.append(HumanMessage(content=message["message"]))
        elif message["user_role"] == "assistant":
            chat_history.append(AIMessage(content=message["message"]))
    return chat_history

def respond_to_message(llm, query, tools, chat_session, user):
    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    all_messages = ChatHistory.objects.filter(Q(user = user) & Q(session=chat_session))
    serializer = ChatHistorySerializer(all_messages, many=True)
    chat_history = convert_to_history(serializer.data)
    messages = [SystemMessage(content="You are a helpful grant-writing assistant. \
                                       Follow the commands and answer the questions provided by the user to assist them in drafting grant applications. \
                                       You may use the tools provided to you to assist with your answer. ")]
    messages = chat_history + messages
    result = agent_executor.invoke({"input": query, "chat_history": messages})
    print(result)
    return result["output"] #response.content

def format_data(node_label, node_id, node_text, neighborhood_nodes):

    # Start building the result string with node label and node text
    result = f"{node_label[-1]}-{node_id} which is '{node_text} "
    
    # Process each neighboring node and add to the result string
    for i, neighbor in enumerate(neighborhood_nodes):
        relation_type = neighbor['relationType']
        neighbor_labels = ' and ' + f"{neighbor['neighborLabels'][-1]}-{neighbor['neighborId']}"
        neighbor_text = neighbor['neighborText']
        
        # Format relation part
        if i == 0:
            result += f" {relation_type.lower().replace('_', ' ')} {neighbor_labels}-{neighbor['neighborId']} which is '{neighbor_text}'"
        else:
            result += f", and {relation_type.lower().replace('_', ' ')} {neighbor_labels}-{neighbor['neighborId']} which is '{neighbor_text}'"
    
    return result

def draft_from_questions(llm, questions, tools, chat_session, user):
  questions = questions['questions']
  draft = dict()
  for q in questions:
    question_text = q[list(q.keys())[0]]
    query = """Respond to the folowing question from a grant application using the given documents and context: {}""".format(question_text)
    response = respond_to_message(llm, query, tools, chat_session, user)

    # Give draft context to assistant
    chat_history = ChatHistory(user=user, user_role="user", message=q['description'], session=chat_session)
    chat_history.save()
    chat_history = ChatHistory(user=user, user_role="assistant", message=response, documents = document_handler.retrieved_documents[user.id], session=chat_session)
    chat_history.save()
    document_handler.retrieved_documents[user.id] = []

    draft[q['description']] = response

  return draft
