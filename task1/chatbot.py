"""
Rule-Based Chatbot
==================
A simple chatbot that uses if-else logic to respond
to predefined user inputs. Runs in a continuous loop
until the user issues an exit command.
"""


def get_response(user_input: str) -> str | None:
    """
    Match the user's input against a set of predefined rules
    and return the appropriate response.

    Returns None if the user wants to exit.
    """
    # Normalize: lowercase and strip whitespace
    message = user_input.lower().strip()

    # ── Exit commands ────────────────────────────────────────
    if message in ("bye", "exit", "quit", "goodbye", "see you", "stop"):
        return None  # signal to end the conversation

    # ── Greetings ────────────────────────────────────────────
    elif message in ("hi", "hello", "hey", "greetings", "howdy", "hola"):
        return "Hello!  How can I help you today?"

    # ── How are you? ─────────────────────────────────────────
    elif "how are you" in message:
        return "I'm just a program, but I'm running smoothly! Thanks for asking. 😊"

    # ── Name / identity ──────────────────────────────────────
    elif "your name" in message or "who are you" in message:
        return "I'm ChatBuddy, your friendly rule-based chatbot! 🤖"

    # ── Help ─────────────────────────────────────────────────
    elif message in ("help", "commands", "what can you do"):
        return (
            "Here are some things you can try:\n"
            "  • Say hello or hi\n"
            "  • Ask 'How are you?'\n"
            "  • Ask 'What is your name?'\n"
            "  • Ask about the time, date, or weather\n"
            "  • Say 'tell me a joke'\n"
            "  • Ask 'What is AI?'\n"
            "  • Type 'bye' or 'exit' to quit"
        )

    # ── Time / Date ──────────────────────────────────────────
    elif "time" in message or "date" in message:
        from datetime import datetime
        now = datetime.now()
        return f"The current date and time is: {now.strftime('%Y-%m-%d %H:%M:%S')} 🕐"

    # ── Weather (simulated) ──────────────────────────────────
    elif "weather" in message:
        return "I can't check live weather, but I hope it's sunny where you are! ☀️"

    # ── Joke ─────────────────────────────────────────────────
    elif "joke" in message:
        return "Why do programmers prefer dark mode? Because light attracts bugs! 😄"

    # ── Thanks ───────────────────────────────────────────────
    elif message in ("thanks", "thank you", "thx"):
        return "You're welcome! Happy to help. "

    # ── Age ───────────────────────────────────────────────────
    elif "how old" in message or "your age" in message:
        return "I don't have an age — I was just created to chat with you! 🕰️"

    # ── AI / chatbot concept ─────────────────────────────────
    elif "what is ai" in message or "artificial intelligence" in message:
        return (
            "AI (Artificial Intelligence) is the simulation of human intelligence "
            "by machines. I'm a very simple example — I use predefined rules instead "
            "of machine learning. 🧠"
        )

    elif "what is a chatbot" in message:
        return (
            "A chatbot is a program that simulates conversation with users. "
            "I'm a rule-based chatbot, meaning I follow predefined if-else logic "
            "to respond to your messages. 💬"
        )

    # ── Default fallback ─────────────────────────────────────
    else:
        return (
            "Sorry, I don't understand that. 🤔\n"
            "Type 'help' to see what I can do."
        )


def main():
    """Run the chatbot in a continuous input loop."""
    print("=" * 50)
    print("   🤖  Welcome to ChatBuddy!  🤖")
    print("=" * 50)
    print("Type anything to chat. Type 'bye' to exit.\n")

    while True:
        try:
            user_input = input("You: ")
        except (EOFError, KeyboardInterrupt):
            # Handle Ctrl+C or piped input gracefully
            print("\nChatBuddy: Goodbye! Have a great day! 👋")
            break

        if not user_input.strip():
            continue  # ignore empty input

        response = get_response(user_input)

        if response is None:
            print("ChatBuddy: Goodbye! Have a great day! 👋")
            break

        print(f"ChatBuddy: {response}\n")


if __name__ == "__main__":
    main()
