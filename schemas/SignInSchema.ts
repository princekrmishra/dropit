import * as z from "zod"

export const signInSchema = z
    .object({
        identifier: z
            .string()
            .min(1, {message: "Email is required"})
            .email({message: "Please enter a valid email"}),
        password: z
            .string()
            .min(1, {message: "Password is required"})
            .min(8, {message: "Password must be atleast of 8 character"}),
        passwordConfirmation: z
            .string()
            .min(1, {message: "Please confirm your password"}),
    })
    
.refine((data) => data.password === data.passwordConfirmation, {
    message: "Password do not match",
    path: ["passwordConfirmation"],
})
