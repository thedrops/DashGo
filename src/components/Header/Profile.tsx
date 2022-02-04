import { Avatar, Box, Button, Flex, Icon, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { RiLogoutBoxLine } from "react-icons/ri";
import { AuthContext, signOut } from "../../contexts/AuthContext";

interface ProfileProps{
    showProfileData?: boolean;
}

export function Profile({showProfileData = true} :ProfileProps){
    const { user } = useContext(AuthContext)

    return (
        <Flex align="center">
            { showProfileData && (
                <Box mr="4" textAlign="right">
                    <Text>Pedro Henrique</Text>
                    <Text color="gray.300" fontSize="small">{user?.email}</Text>
                </Box>
            )}
            
            <Avatar size="md" name="Pedro Teixeira" src="https://github.com/thedrops.png" />
            <Button onClick={signOut} ml="4" as="a" size="sm" fontSize="sm" colorScheme="pink" rightIcon={<Icon fontSize="20" as={RiLogoutBoxLine}/>} >
                Logout
            </Button>
        </Flex>
    );
}