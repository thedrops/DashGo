import {Flex, Button, Stack,} from '@chakra-ui/react'
import { Input } from '../components/Form/Input'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'
import {yupResolver} from '@hookform/resolvers/yup'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'
import { withSSRGuest } from '../../utils/withSSRGuest'

type SignInFormData = {
  email: string;
  password: string;
}

const signInFormSchema = yup.object().shape({
  email: yup.string().required('E-mail obrigatório').email('E-mail inválido'),
  password: yup.string().required('Password obrigatório'),
})


export default function Home() {


  const { signIn } = useContext(AuthContext)

  const { register, handleSubmit, formState } = useForm({resolver: yupResolver(signInFormSchema)})

  const { errors } = formState

  const handleSignIn: SubmitHandler<SignInFormData> = async (values) => {
    await signIn(values)
  }

  return (
    <Flex w="100vw" h="100vh" align="center" justify="center" >
      <Flex onSubmit={handleSubmit(handleSignIn)} as="form" width="100%" maxWidth={360} bg="gray.800" p="8" borderRadius={8} flexDir="column">
        <Stack spacing="4">
          <Input error={errors.email} {...register('email')} name="email" type="email" label="E-mail"  />
          <Input error={errors.password} {...register('password')} name="password" type="password" label="Password"  />
        </Stack>
        <Button colorScheme="pink" type="submit" mt="6" size="lg" isLoading={formState.isSubmitting}>Entrar</Button>
      </Flex>
    </Flex>

   
  )
}

export const getServerSideProps: GetServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {}
  }
})