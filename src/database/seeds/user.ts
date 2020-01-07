import { IUser } from "../../interfaces/IUser";
import { IProblem } from "../../interfaces/IProblem";

export const sampleUsers: IUser[] = [
    {
        username: "myUser",
        email: "user@mysite.com",
        role: "admin",
        info: {

            major: "Computer Science",
            year: "3",
            school: "McGill University",
            bio: "Hi! I'm a user!",
            profilePhoto: "link.to.profile.photo"
        },
        createdAt: "394820498",
        updatedAt: "494820499",
        problems: [
            {
                problemId: "507f191e810c19729de860ea",
                isComplete: true
            },
            {
                problemId: "507f191e810c19729de860eb",
                isComplete: false
            }
        ]
    },
    {
        username: "myUser2",
        email: "user2@mysite.com",
        role: "user",
        info: {

            major: "Computer Science",
            year: "1",
            school: "Concordia University",
            bio: "Hi! I'm a second user!",
            profilePhoto: "link.to.profile.photo2"
        },
        createdAt: "594820498",
        updatedAt: "694820499",
        problems: [
            {
                problemId: "507f191e810c19729de860ec",
                isComplete: false
            },
            {
                problemId: "507f191e810c19729de860ed",
                isComplete: true
            }
        ]
    }
]