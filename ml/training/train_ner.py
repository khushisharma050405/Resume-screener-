import os
import json
import spacy
from spacy.tokens import DocBin
from spacy.training import Example

def train_custom_ner(data_dir: str, output_model_dir: str):
    print("[Training] Starting custom Resume NER model training pipeline...")
    
    train_file = os.path.join(data_dir, "train", "train.json")
    if not os.path.exists(train_file):
        print("[Error] Training dataset not found. Running prepare_dataset.py first...")
        from ml.data.prepare_dataset import prepare_splits
        prepare_splits(data_dir)

    with open(train_file, "r") as f:
        train_data = json.load(f)

    # Initialize blank English model
    nlp = spacy.blank("en")
    ner = nlp.add_pipe("ner", last=True)

    # Add entity labels
    labels = ["PERSON", "JOB_TITLE", "COMPANY", "DEGREE", "UNIVERSITY", "SKILL", "DATE"]
    for label in labels:
        ner.add_label(label)

    # Convert training data to spaCy Examples
    examples = []
    for item in train_data:
        text = item["text"]
        annotations = {"entities": item["entities"]}
        doc = nlp.make_doc(text)
        example = Example.from_dict(doc, annotations)
        examples.append(example)

    # Train model for 10 epochs
    optimizer = nlp.begin_training()
    for i in range(10):
        losses = {}
        for example in examples:
            nlp.update([example], drop=0.2, sgd=optimizer, losses=losses)
        print(f"Epoch {i+1}/10 - Loss: {losses.get('ner', 0.0):.4f}")

    os.makedirs(output_model_dir, exist_ok=True)
    nlp.to_disk(output_model_dir)
    print(f"[Training] Model successfully saved to {output_model_dir}")

if __name__ == "__main__":
    ml_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(ml_dir, "data")
    models_dir = os.path.join(ml_dir, "models", "custom_resume_ner")
    train_custom_ner(data_dir, models_dir)
