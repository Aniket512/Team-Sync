interface User {
  access_token: string;
  _id: string;
  name: string;
  email: string;
  image: string;
}

export const isUserLoggedIn = (): boolean => {
  const userString: string | null = localStorage.getItem("user");

  if (userString === null) {
    return false;
  }

  const user: User = JSON.parse(userString);

  if (!user || !user.access_token) {
    return false;
  }

  return true;
};

export const setUserLoggedIn = (user: User): void => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const setUserLoggedOut = (): void => {
  localStorage.clear();
};

export const getUserData = (): User | null => {
  const userDataString: string | null = localStorage.getItem("user");
  return userDataString ? JSON.parse(userDataString) : null;
};

export const getUserId = (): string => {
  const user: User | null = getUserData();
  return user ? user._id : "";
};

export const getUserName = (): string => {
  const user: User | null = getUserData();
  return user ? user.name : "";
};

export const getUserMail = (): string => {
  const user: User | null = getUserData();
  return user ? user.email : "";
};

export const getAccessToken = (): string => {
  const user: User | null = getUserData();
  return user ? user.access_token : "";
};

export const getUserImage = (): string => {
  const user: User | null = getUserData();
  return user ? user.image : "";
};
