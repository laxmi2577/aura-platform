from textblob import TextBlob

def analyze_sentiment(text: str):
    """
    Natural Language Processing Utility.
    Uses TextBlob to calculate semantic polarity (-1.0 to 1.0) and subjective intensity.
    Maps continuous polarity scores to discrete categories (POSITIVE, NEGATIVE, NEUTRAL)
    for downstream logic in the AI Coach.
    """
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity # -1.0 to 1.0

    # Determine label
    if polarity > 0.1:
        label = "POSITIVE"
    elif polarity < -0.1:
        label = "NEGATIVE"
    else:
        label = "NEUTRAL"

    return {
        "score": polarity,
        "label": label
    }