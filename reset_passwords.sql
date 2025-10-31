-- Reset password cho cm01 va rev01 thanh "123456"
-- AuthController dung PBKDF2 (PasswordSalt + PasswordHash2)
-- Neu 2 cot do NULL thi dung LegacyPassword (plaintext)

SET QUOTED_IDENTIFIER ON;
GO

UPDATE lms.Users 
SET LegacyPassword = '123456',
    PasswordSalt = NULL,
    PasswordHash2 = NULL
WHERE Username = 'cm01';

UPDATE lms.Users 
SET LegacyPassword = '123456',
    PasswordSalt = NULL,
    PasswordHash2 = NULL
WHERE Username = 'rev01';

GO

SELECT UserId, Username, FullName, LegacyPassword, PasswordSalt, PasswordHash2
FROM lms.Users
WHERE Username IN ('cm01', 'rev01');
GO
