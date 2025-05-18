# Developmental Milestone Questionnaire Application

## Core Concept: Developmental Matrix (DLM)

The Developmental Matrix (DLM) is the heart of our application, serving as a comprehensive knowledge base for developmental milestones and their relationships. This matrix powers our AI-driven milestone prediction system.

### DLM Structure
- **Format**: JSONL (JSON Lines) file
- **Content**: 
  - ~308 developmental milestones
  - ~1000 relationships between milestones
  - Each milestone can have pre/post relationships with other milestones
  - Forms an interconnected network of developmental progressions

### Application Flow
1. **User Input**
   - Parents/caregivers log in to the application
   - Complete questionnaires about their child
   - Input specific concerns about their child's development

2. **AI Processing**
   - The system uses the DLM to analyze the input
   - Considers the relationships between milestones
   - Generates appropriate milestone predictions

3. **Output**
   - Provides predicted milestones based on the child's current development
   - Shows relationships between milestones
   - Offers guidance for developmental progress

### Technical Implementation
- The DLM is used to create a graph-like structure of milestones
- Each milestone can be:
  - A prerequisite for other milestones
  - A subsequent milestone to others
  - Part of multiple developmental pathways

### Key Features
- **Interconnected Milestones**: Each milestone is part of a larger developmental network
- **AI-Driven Predictions**: Uses the DLM to make informed predictions about developmental progress
- **Parent-Caregiver Focus**: Designed to help parents and caregivers track and understand their child's development
- **Comprehensive Coverage**: Covers a wide range of developmental areas

### Roles & Permissions
- **PARENT/CAREGIVER**: Can only view and interact with their own child's data.
- **DOCTOR**: May be part of a specific kid's team and can only see data for kids they are assigned to. Cannot access or manage the global DLM or feedback unless also an ADMIN/SME.
- **ADMIN/SME (Subject Matter Expert)**: Superusers with global access. Can view and manage all feedback, the entire DLM, and sync feedback or add new milestones/tasks to the DLM.

### DLM Update & Feedback Workflow
- **Feedback from parents/caregivers** is collected via MilestoneTask objects.
- **ADMIN/SME** users review feedback and can update DLM ratings (upvotes/downvotes) or add new milestones/tasks to the DLM.
- **DOCTOR** users can only review and interact with feedback for kids they are assigned to, not the global DLM.
- All DLM entries are considered active/approved once created or updated by ADMIN/SME.

### Development Notes
- The DLM should be treated as a core asset of the application
- Any updates to the DLM should be carefully tested to ensure relationship integrity
- The AI prediction system relies heavily on the accuracy and completeness of the DLM
- Only ADMIN/SME can make global changes to the DLM and feedback

### Future Considerations
- Regular updates to the DLM based on new research and reviewed feedback
- Expansion of milestone relationships
- Enhancement of AI prediction algorithms
- Integration with additional developmental assessment tools

## Getting Started
[Additional setup and development instructions can be added here]

## Contributing
[Guidelines for contributing to the project can be added here]

## License
[License information can be added here]