from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import torch

print("Starting TinyLlama setup...")

# Specify the model name
model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

# Load the tokenizer
print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(model_name)
print("Tokenizer loaded.")

# Check GPU availability
print("CUDA available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print(f"Using GPU: {torch.cuda.get_device_name(0)}")
else:
    print("Falling back to CPU")

# Configure 4-bit quantization with BitsAndBytes
quant_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16
)

# Load the model with quantization
print("Loading model with 4-bit quantization...")
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=quant_config,
    device_map="auto",
    torch_dtype=torch.float16,
    low_cpu_mem_usage=True
)
print("Model loaded successfully.")

# Test it with a simple input
input_text = "Hello, how can I assist you today?"
print(f"Generating response for: '{input_text}'")
inputs = tokenizer(input_text, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
outputs = model.generate(**inputs, max_length=50)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print("Response:", response)
print("Setup complete!")