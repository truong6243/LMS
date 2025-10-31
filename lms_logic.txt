View + 2 function của lms

lms.fn_GetEffectiveActions

IF OBJECT_ID('lms.fn_GetEffectiveActions','IF') IS NOT NULL
    DROP FUNCTION lms.fn_GetEffectiveActions;
GO

CREATE FUNCTION lms.fn_GetEffectiveActions (@UserId INT)
RETURNS TABLE
AS
RETURN
(
    ;WITH RoleGrants AS (
        SELECT a.ActionId
        FROM lms.Actions a
        JOIN lms.RoleActions ra ON ra.ActionId = a.ActionId
        JOIN lms.UserRoles  ur ON ur.RoleId  = ra.RoleId
        WHERE ur.UserId = @UserId
    ),
    UserGrants AS (
        SELECT a.ActionId
        FROM lms.Actions a
        JOIN lms.UserActions ua ON ua.ActionId = a.ActionId
        WHERE ua.UserId = @UserId AND ua.IsDenied = 0
    ),
    UserDenies AS (
        SELECT a.ActionId
        FROM lms.Actions a
        JOIN lms.UserActions ua ON ua.ActionId = a.ActionId
        WHERE ua.UserId = @UserId AND ua.IsDenied = 1
    ),
    UnionGrants AS (
        SELECT ActionId FROM RoleGrants
        UNION
        SELECT ActionId FROM UserGrants
    )
    SELECT a.*
    FROM lms.Actions a
    JOIN UnionGrants g ON g.ActionId = a.ActionId
    WHERE a.ActionId NOT IN (SELECT ActionId FROM UserDenies)
);
GO

lms.fn_UserHasAction
IF OBJECT_ID('lms.fn_UserHasAction','FN') IS NOT NULL
    DROP FUNCTION lms.fn_UserHasAction;
GO

CREATE FUNCTION lms.fn_UserHasAction
(
    @UserId     INT,
    @ActionCode NVARCHAR(100)
)
RETURNS BIT
AS
BEGIN
    DECLARE @r BIT = 0;
    IF EXISTS (
        SELECT 1
        FROM lms.fn_GetEffectiveActions(@UserId) ea
        WHERE ea.ActionCode = @ActionCode
    )
        SET @r = 1;
    RETURN @r;
END
GO

View lms.v_MenuByUser
IF OBJECT_ID('lms.v_MenuByUser','V') IS NOT NULL
    DROP VIEW lms.v_MenuByUser;
GO

CREATE VIEW lms.v_MenuByUser
AS
SELECT
    ur.UserId,
    a.ActionId,
    a.ActionCode,
    a.ActionName,
    a.Path,
    a.MenuGroup,
    a.ParentId,
    a.SortOrder,
    a.Icon
FROM lms.UserRoles ur
CROSS APPLY lms.fn_GetEffectiveActions(ur.UserId) ea
JOIN lms.Actions a ON a.ActionId = ea.ActionId
WHERE a.IsMenu = 1;
GO
