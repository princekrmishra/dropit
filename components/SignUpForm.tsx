"use-client"

import { useForm } from "react-hook-form"
import { useSignUp } from "@clerk/nextjs"
import { z } from "zod"

//zod custom schema
import { signUpSchema } from "@/schemas/signUpSchema"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Card, CardBody, CardHeader } from "@heroui/react"
import {Divider} from "@heroui/divider";

export default function SignUpForm(){
    const router = useRouter()
    const [verifying, setVerifying] = useState(false);
    const [isSubmitting, SetIsSubmitting] = useState(false);
    const [verificationCode, setVerificationCode] = useState("")
    const [authError, setAuthError] = useState<string | null>(null)
    const [verificationError, setVerificationError] = useState<string | null>(null)
    const {signUp, isLoaded, setActive} = useSignUp();

    const{
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            passwordConfirmation: "",
        }
    })

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        if(!isLoaded) return;
        SetIsSubmitting(true)
        setAuthError(null)

        try{
            await signUp.create({
                emailAddress: data.email,
                password: data.password
            })
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            })
            setVerifying(true)
        } catch ( error: any ){
            console.error("Signup error", error)
            setAuthError(
                error.errors?.[0]?.message || "An error occured during the signup. Please try again"
            )
        } finally{
            SetIsSubmitting(false)
        }
    };

    const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if(!isLoaded || !signUp) return
        SetIsSubmitting(true)
        setAuthError(null)

        try{
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode
            })
            //todo: console result
            if(result.status === "complete"){
                await setActive({session: result.createdSessionId})
                router.push("/dashboard")
            }else{
                console.error("Verification incomplete", result)
                setVerificationError(
                    "Verification could not be complete"
                )
            }
        } catch ( error: any ){
            console.error("Verification incomplete", error)
            setVerificationError(
                error.errors?.[0]?.message || "An error occured during the signup. Please try again"
            );
        }finally{
              SetIsSubmitting(false)  
        }
    }

    if(verifying){
        return (
        <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
            <CardHeader className="flex flex-col gap-1 items-center pb-2">
            <h1 className="text-2xl font-bold text-default-900">
                Verify Your Email
            </h1>
            <p className="text-default-500 text-center">
                We've Sent a Verification Code to Your Email
            </p>
      </CardHeader>

      <Divider />
    </Card>
        )
    }

    return <h1>signup form with email and other fields</h1>
}