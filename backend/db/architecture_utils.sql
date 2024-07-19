-- RETURN BACK TO INITIAL STATE
update tasks set worker_id = NULL, status = 'pending';
delete from tasks where issue_id in (select id from issues where granularity > 1);
delete from issues where granularity > 1;
update issues set complexity_score = 100, scope_score = 100, analysis_done = false where parent_id is NULL;
-- DELETE INSIGHTS AND RESET ID SEQUENCE
delete from insights;
ALTER SEQUENCE insights_id_seq RESTART WITH 1;

-- ONLY TO TEST ANALYSIS
update tasks set status = 'completed', worker_id = NULL where task_type_id != 3;
update tasks set status = 'pending', worker_id = NULL where task_type_id = 3;
update issues set complexity_score = 100, scope_score = 100 where parent_id is NULL;

-- DELETE ALL TASKS IN ORDER TO GENERATE THEM AGAIN AND RESET THE ID SEQUENCE
-- TO GENERATE TASKS, THE CODE WILL LOOK INTO THE ISSUES TABLE AND THE TASKS TABLE
DELETE FROM tasks;
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;

-- START THE ID SEQUENCE IN ISSUES FROM 5 (LENGTH OF ROOT PROBLEMS (4) + 1)
ALTER SEQUENCE issues_id_seq RESTART WITH 5;

-- In case you need to append to instructions or any other text field
UPDATE instructions
SET instruction = instruction || ' Ensure the JSON array contains ONLY up to four JSON objects.'
WHERE task_type_id = 1;

-- IN case you need to add a column
ALTER TABLE issues
ADD COLUMN context TEXT;

-- Set task_type skip column to true to not do those tasks temporarily (analysis and evaluation)
UPDATE task_types SET skip = true where id = 3 OR id = 4;

-- In case you need to rename a column
ALTER TABLE user_inputs
RENAME COLUMN issue_title TO new_issue_title;

-- Makes a master key
UPDATE usage_keys set type = 'master' where id = 2;

-- ADDS A COLUMN
ALTER TABLE tasks
ADD COLUMN user_input_id INTEGER REFERENCES user_inputs(id);

-- INSERT THE CLIENT SCRIPT HASH
insert into client_script_hash(hash) values ('1f8cf7e99493917803abd1bae070862f3b14e6e75df0da0c4a981e25546da12a');
-- UPDATE THE HASH
update client_script_hash set hash = '1f8cf7e99493917803abd1bae070862f3b14e6e75df0da0c4a981e25546da12a'

-- Add column anonymize to workers table
ALTER TABLE workers
ADD COLUMN anonymize BOOLEAN DEFAULT FALSE;

-- Delete worker information from relational tables
delete from worker_programming_languages where worker_id != 20;
delete from worker_ai_tools where worker_id != 20;
delete from worker_generalized_ai_branches where worker_id != 20;
delete from worker_specialized_ai_applications where worker_id != 20;
delete from workers where id != 20;

-- Insert new icons of fields like this, order them in the frontend
INSERT INTO specialized_ai_applications (name, icon_url)
VALUES ('Artificial Intelligence', '/icons/artificial-intelligence.png');

-- Insert into negative_prompt
INSERT INTO negative_prompt(negative_prompt)
VALUES ('Everything outside of STEM fields, Blockchain, Cryptocurrency, Therapy, Impractical Solutions, Pseudoscience, Alternative Medicine, Psychology, TRT, CBT, Palliative Solutions, '
'Homeopathy, Multi-Level Marketing, Unverified Supplements, Spiritual Healing, Conspiracy Theories, Self-Help Gurus, Motivational Speakers, Mindfulness Apps, '
'Wellness Industry, Personal Development Courses, Manifestation Techniques, Life Coaching, Symptomatic treatments, Temporary relief measures, Short-term fixes, Band-aid solutions, '
'Superficial remedies, Alleviative approaches, Comfort measures, Interim solutions, Symptom management strategies, Mitigative actions.'
)

-- Update instructions like such
-- Update 1 (generation)
UPDATE instructions SET instruction = 
 'The output must be formatted as a JSON object containing the following fields: name, description, field and context. '
 'The |name| field must contain a descriptive and summarized name that appropriately encapsulates the root cause of the analyzed |Issue Title|.'
 'The |description| field must contain a descriptive and informative text related to the |name| field. '
 'The |field| field must contain a categorization of the |name| and |description| within the range of STEM-based fields. '
 'The |context| field must contain the summarized and cleaned up version of the |Issue Context| provided, but without taking out potentially essential data. '
 'ONLY if the |Issue Context| is non-sensical and does not provide enough information, generate a |context| based on your reasoning derived from both the |Issue Title| and |Issue Context|.'
 WHERE id = 1;
-- Update 2 (subdivision)
UPDATE instructions SET instruction = 
 'The output must be formatted as a JSON array containing up to four objects with the following fields: name, description, field and context. '
 'These subdivisions need to be practical and their analysis and evaluation should lead to better proposals, actions, or solutions. ' -- changed
 'The focus must be on diagnosing and understanding the root causes. If these causes are not understood, identify the areas where this is the case and subdivide the root issue into these.' -- changed
 'The |name| must be the title for the sub-issue, the |description| must provide descriptive and practical information about the sub-issue, '
 'and the |field| must be at most two words long and is defined as the field under which the sub-issue is categorized, '
 'like Healthcare, Economics, Technology, Artificial Intelligence, Physics and Mathematics among other examples. STEM fields are preferred. '
 'The descriptions must describe the name field, and not propose a solution or actions. '
 'The |context| field must contain a aggregated context that connects the current context provided with additional context based on the current |name|, |description| and |field| generated. '
 'The output must consist only of the JSON array and nothing else. '
 'Ensure the JSON array contains ONLY up to four JSON objects.'
 WHERE id = 2;
-- Update 5 (proposition)
UPDATE instructions SET instruction = 
 'The output must be formatted as a JSON array containing up to four objects with the following fields: name, description, and field. '
 'The |name| must be the title for the proposed action or solution, the |description| must provide detailed information about the proposed action or solution, '
 'and the |field| must be at most two words long and is defined as the field under which the proposed action is categorized, '
 'like Healthcare, Economics, Technology, Artificial Intelligence, Physics and Mathematics among other examples. '
 'The descriptions must describe the |name| field, focusing on the proposed action or solution without evaluating or implementing it. '
 'Exclude proposals that offer palliative or symptom-masking solutions, and instead focus on identifying, addressing or exploring long-term or short-term, fundamental solutions. '
 'Please use the context provided to establish relationships between it and the proposed action or solution and base your response on these insights. '
 'The output must consist only of the JSON array and nothing else.'
 WHERE id = 5;
-- Update 6 (extrapolation)
UPDATE instructions SET instruction = 
'The output must be formatted as a JSON array containing up to four objects with the following fields: name, description, and field. '
 'The |name| is the title of the proposed action or solution. The |description| provides detailed information about the proposal, staying brief but informative. '
 'The |field| indicates the category of the originating idea and must be at most two words long, such as Neuroscience, Economics, Technology, or Physics. '
 'The solutions should be derived by applying concepts, methods, or ideas from one field to another, focusing on innovative, cross-disciplinary approaches from STEM fields. '
 'Exclude proposals that offer palliative or symptom-masking solutions, and instead focus on identifying, addressing or exploring long-term or short-term, fundamental solutions. '
 'Please use the context provided to establish relationships between it and the proposed action or solution and base your response on these insights. '
 'Avoid phrases like "Taking cues from" or "Inspired by the principles of" or "Borrowing from" or "Drawing from" and directly state the concept. '
 'The output must consist only of the JSON array and nothing else.'
 WHERE id = 6;

 -- Make a new run
delete from proposals;
delete from extrapolations;
delete from tasks;
delete from user_inputs;
delete from issues;