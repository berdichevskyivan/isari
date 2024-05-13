-- Insert initial data into the workers table
INSERT INTO workers (name, email, password, github_url, profile_picture_url, wallet_address)
VALUES 
('John Doe', 'john.doe@example.com', 'password123', 'https://github.com/johndoe', 'https://example.com/images/johndoe.jpg', '0x1234567890abcdef1234567890abcdef12345678');

-- Insert data into the programming_languages table
INSERT INTO programming_languages (name, description, icon_url)
VALUES 
('Python', 'Python is widely used in AI for its simplicity and powerful libraries such as TensorFlow and PyTorch.', '/src/assets/icons/python.svg'),
('JavaScript', 'JavaScript is used in AI for building web-based AI applications and frameworks like TensorFlow.js.', '/src/assets/icons/javascript.svg'),
('TypeScript', 'TypeScript, a superset of JavaScript, is used for building scalable AI applications with type safety.', '/src/assets/icons/typescript.svg'),
('Java', 'Java is used in AI for building robust, large-scale applications, especially in enterprise environments.', '/src/assets/icons/java.svg'),
('C++', 'C++ is used in AI for performance-critical applications and developing AI frameworks and libraries.', '/src/assets/icons/cplusplus.svg'),
('R', 'R is used in AI for statistical computing and data analysis, particularly in academic and research settings.', '/src/assets/icons/r.svg'),
('Julia', 'Julia is used in AI for its high performance in numerical and scientific computing.', '/src/assets/icons/julia.svg'),
('Swift', 'Swift is used in AI primarily for developing AI applications on Apple platforms.', '/src/assets/icons/swift.svg'),
('Scala', 'Scala is used in AI for its functional programming features and compatibility with big data tools like Apache Spark.', '/src/assets/icons/scala.svg'),
('Kotlin', 'Kotlin is used in AI for developing Android applications and leveraging Java-based AI libraries.', '/src/assets/icons/kotlin.svg');

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
('Healthcare', '/src/assets/icons/healthcare.png'),
('Autonomous Vehicles', '/src/assets/icons/autonomous-vehicles.png'),
('Gaming', '/src/assets/icons/gaming.png'),
('Finance', '/src/assets/icons/finance.png'),
('Quantum', '/src/assets/icons/quantum-ai.png'),
('Security', '/src/assets/icons/security.png'),
('Edge', '/src/assets/icons/edge-ai.png');

-- Insert data into the ai_tools table
INSERT INTO ai_tools (name, icon_url)
VALUES 
('ChatGPT', '/src/assets/icons/gpt.svg'),
('Llama', '/src/assets/icons/meta.svg'),
('PyTorch', '/src/assets/icons/pytorch.svg'),
('TensorFlow', '/src/assets/icons/tensorflow.svg'),
('Gemini', '/src/assets/icons/gemini.svg'),
('Mistral', '/src/assets/icons/mistral.svg'),
('Github Copilot', '/src/assets/icons/github-copilot.svg'),
('Open CV', '/src/assets/icons/opencv.svg'),
('Apache Kafka', '/src/assets/icons/apachekafka.svg');