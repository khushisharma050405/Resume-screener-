import os
import json
import random

SAMPLE_TRAINING_DATA = [
    {
        "text": "Alex Rivera is a Senior Machine Learning Engineer at Google with 5 years of experience building NLP transformers in PyTorch and Python.",
        "entities": [
            [0, 11, "PERSON"],
            [17, 44, "JOB_TITLE"],
            [48, 54, "COMPANY"],
            [60, 67, "DATE"],
            [90, 93, "SKILL"],
            [94, 106, "SKILL"],
            [110, 117, "SKILL"],
            [122, 128, "SKILL"]
        ]
    },
    {
        "text": "Sarah Chen holds a Bachelor of Technology in Computer Science from Stanford University. Proficient in Python, SQL, PostgreSQL, and AWS.",
        "entities": [
            [0, 10, "PERSON"],
            [19, 41, "DEGREE"],
            [45, 61, "DEGREE"],
            [67, 86, "UNIVERSITY"],
            [103, 109, "SKILL"],
            [111, 114, "SKILL"],
            [116, 126, "SKILL"],
            [132, 135, "SKILL"]
        ]
    },
    {
        "text": "Michael Chang worked as Full Stack Developer at Amazon Web Services developing Next.js, React, and Node.js web applications.",
        "entities": [
            [0, 13, "PERSON"],
            [24, 44, "JOB_TITLE"],
            [48, 67, "COMPANY"],
            [79, 86, "SKILL"],
            [88, 93, "SKILL"],
            [99, 106, "SKILL"]
        ]
    }
]

def prepare_splits(data_dir: str):
    os.makedirs(os.path.join(data_dir, "raw"), exist_ok=True)
    os.makedirs(os.path.join(data_dir, "train"), exist_ok=True)
    os.makedirs(os.path.join(data_dir, "validation"), exist_ok=True)
    os.makedirs(os.path.join(data_dir, "test"), exist_ok=True)

    # Save raw dataset
    raw_path = os.path.join(data_dir, "raw", "resume_ner_dataset.json")
    with open(raw_path, "w") as f:
        json.dump(SAMPLE_TRAINING_DATA, f, indent=2)

    # Split train, val, test
    data = list(SAMPLE_TRAINING_DATA)
    random.shuffle(data)

    train_data = data[:2]
    val_data = data[2:]
    test_data = data[2:]

    with open(os.path.join(data_dir, "train", "train.json"), "w") as f:
        json.dump(train_data, f, indent=2)
    with open(os.path.join(data_dir, "validation", "val.json"), "w") as f:
        json.dump(val_data, f, indent=2)
    with open(os.path.join(data_dir, "test", "test.json"), "w") as f:
        json.dump(test_data, f, indent=2)

    print(f"[Dataset] Created train ({len(train_data)}), validation ({len(val_data)}), test ({len(test_data)}) splits.")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prepare_splits(os.path.join(base_dir, "data"))
