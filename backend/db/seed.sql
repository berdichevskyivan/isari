-- Insert initial data into the workers table
INSERT INTO workers (name, email, password, github_url, profile_picture_url, wallet_address)
VALUES 
('John Doe', 'john.doe@example.com', 'password123', 'https://github.com/johndoe', 'https://example.com/images/johndoe.jpg', '0x1234567890abcdef1234567890abcdef12345678');

-- Insert data into the programming_languages table
INSERT INTO programming_languages (name, description, icon_url)
VALUES 
('Python', 'Python is widely used in AI for its simplicity and powerful libraries such as TensorFlow and PyTorch.', '/icons/python.svg'),
('JavaScript', 'JavaScript is used in AI for building web-based AI applications and frameworks like TensorFlow.js.', '/icons/javascript.svg'),
('TypeScript', 'TypeScript, a superset of JavaScript, is used for building scalable AI applications with type safety.', '/icons/typescript.svg'),
('Java', 'Java is used in AI for building robust, large-scale applications, especially in enterprise environments.', '/icons/java.svg'),
('C++', 'C++ is used in AI for performance-critical applications and developing AI frameworks and libraries.', '/icons/cplusplus.svg'),
('R', 'R is used in AI for statistical computing and data analysis, particularly in academic and research settings.', '/icons/r.svg'),
('Julia', 'Julia is used in AI for its high performance in numerical and scientific computing.', '/icons/julia.svg'),
('Swift', 'Swift is used in AI primarily for developing AI applications on Apple platforms.', '/icons/swift.svg'),
('Scala', 'Scala is used in AI for its functional programming features and compatibility with big data tools like Apache Spark.', '/icons/scala.svg'),
('Kotlin', 'Kotlin is used in AI for developing Android applications and leveraging Java-based AI libraries.', '/icons/kotlin.svg'),
('Rust', 'Rust is used in AI for its memory safety, performance, and concurrency capabilities, making it suitable for building high-performance and safe AI applications.', '/icons/rust.svg');

-- Insert data into the generalized_ai_branches table
INSERT INTO generalized_ai_branches (code, name, description)
VALUES 
('ML', 'Machine Learning', 'Machine Learning involves the use of algorithms and statistical models to enable machines to improve their performance on a task with experience.'),
('DL', 'Deep Learning', 'Deep Learning is a subset of Machine Learning that uses neural networks with many layers to model complex patterns in data.'),
('NLP', 'Natural Language Processing', 'Natural Language Processing focuses on the interaction between computers and humans through natural language, enabling machines to understand and respond to text or speech.'),
('CV', 'Computer Vision', 'Computer Vision is the field of AI that enables machines to interpret and make decisions based on visual data from the world.'),
('R', 'Robotics', 'Robotics involves the design, construction, and use of robots to perform tasks that are typically done by humans.'),
('DS', 'Data Science', 'Data Science combines domain expertise, programming skills, and knowledge of mathematics and statistics to extract meaningful insights from data.');

-- Insert data into the specialized_ai_applications table
INSERT INTO specialized_ai_applications (name, icon_url)
VALUES 
('Artificial Intelligence', '/icons/artificial-intelligence.png'),
('Healthcare', '/icons/healthcare.png'),
('Autonomous Vehicles', '/icons/autonomous-vehicles.png'),
('Gaming', '/icons/gaming.png'),
('Finance', '/icons/finance.png'),
('Quantum', '/icons/quantum-ai.png'),
('Security', '/icons/security.png'),
('Edge', '/icons/edge-ai.png');

-- Insert data into the ai_tools table
INSERT INTO ai_tools (name, icon_url)
VALUES 
('ChatGPT', '/icons/gpt.svg'),
('Llama', '/icons/meta.svg'),
('PyTorch', '/icons/pytorch.svg'),
('TensorFlow', '/icons/tensorflow.svg'),
('Gemini', '/icons/gemini.svg'),
('Mistral', '/icons/mistral.svg'),
('Github Copilot', '/icons/github-copilot.svg'),
('Open CV', '/icons/opencv.svg'),
('Apache Kafka', '/icons/apachekafka.svg'),
('Hugging Face', '/icons/hugging-face.png');