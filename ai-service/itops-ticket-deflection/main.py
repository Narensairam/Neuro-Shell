from src.agent import TicketAgent
from src.preprocess import combine_text, load_data


def main():
    df = load_data()
    texts = combine_text(df)
    resolutions = df["resolution"].tolist()

    agent = TicketAgent(threshold=0.5)
    agent.train(texts, resolutions)

    print("\nAI Ticket Deflection System Ready\n")

    while True:
        query = input("Enter your issue: ")
        result = agent.handle_ticket(query)

        if result["status"] == "Deflected":
            print("\nIssue Auto-Resolved!")
            print(f"Solution: {result['solution']}")
            print(f"Confidence: {result['confidence']:.2f}")
            print(f"Matched issue: {result['matched_issue'][:100]}")
        else:
            print("\nCould not auto-resolve.")
            print(f"Confidence: {result['confidence']:.2f}")
            print("\nClosest matches:")
            for suggestion in result["suggestions"]:
                print(f"- {suggestion[:100]}")


if __name__ == "__main__":
    main()
