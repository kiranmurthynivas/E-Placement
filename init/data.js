const sampleStudents = [
    {
        username: "Kiran Murthy K S",  // Used for login with passport-local-mongoose
        usn: "1MV22CS075",
        branch: "Computer Science",
        mobileNumber: "8431204256",
        email: "kiranmurthynivas29@.com",
        role: "student",
        password: "kiran123", // Remember to hash the password before storing
    },
];

module.exports = { data: sampleStudents };
