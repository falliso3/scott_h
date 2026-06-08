Hello!

This is SCOTT H:

Scott
Creates &
Organizes
Text
Tables (about)

Hobbies

SCOTT H uses MongoDB Clusters to store information and allow a super user to access and view
any data they so wish to see. For example, if you wanted to search for everyone whose favorite
hobby is running or who has running as one of their top 5 favorite hobbies, you could do that
by selecting some items from the list of querying options.

This is basically just creating another interface for SQL, where instead of typing
SELECT *
FROM genericTableName
Where conditionIsMet

You would instead choose from a drop down, assuming you're the super user:
Dropdown:     ["SELECT", "INSERT", "REMOVE", "UPDATE"]
  if SELECT:  ["*"]
    FROM:     ["table"]
    WHERE:    ["hobby1/2/3/4/5 == TEXT" AND/OR "hobby1 == TEXT OR hobby2 == TEXT, etc.]

