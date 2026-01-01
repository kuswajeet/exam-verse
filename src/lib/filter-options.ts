export const filterOptions = [
    {
      value: "engineering",
      label: "Engineering",
      exams: [
        {
          value: "jee-main",
          label: "JEE Main",
          subjects: [
            { value: "physics", label: "Physics" },
            { value: "chemistry", label: "Chemistry" },
            { value: "maths", label: "Maths" },
          ],
        },
        {
          value: "gate",
          label: "GATE",
          subjects: [
            { value: "computer-science", label: "Computer Science" },
            { value: "mechanical", label: "Mechanical" },
            { value: "electrical", label: "Electrical" },
          ],
        },
      ],
    },
    {
      value: "medical",
      label: "Medical",
      exams: [
        {
          value: "neet",
          label: "NEET",
          subjects: [
            { value: "physics", label: "Physics" },
            { value: "chemistry", label: "Chemistry" },
            { value: "biology", label: "Biology" },
          ],
        },
      ],
    },
    {
        value: "general",
        label: "General",
        exams: [
            {
                value: "sat",
                label: "SAT",
                subjects: [
                    { value: "math", label: "Math" },
                    { value: "reading", label: "Reading" },
                    { value: "writing", label: "Writing" },
                ]
            }
        ]
    }
  ];
  
  export const getExamsForCategory = (categoryValue: string) => {
    const category = filterOptions.find(cat => cat.value === categoryValue);
    return category ? category.exams : [];
  };
  
  export const getSubjectsForExam = (categoryValue: string, examValue: string) => {
    const category = filterOptions.find(cat => cat.value === categoryValue);
    if (!category) return [];
    const exam = category.exams.find(ex => ex.value === examValue);
    return exam ? exam.subjects : [];
  };
  