export const flatData = (runner) => {
    runner.data = runner.data.flatMap(row => row.meta.user_ids.map(id => ({
        ...row, meta: {...row.meta, user_id: id}
    })));
    return runner;
};

export const filterUsers = (runner) => {
    runner.data = runner.data.filter(user => {
        return runner.meta.only_user.trim() === user.meta.main_user.trim();
    });

    return runner;
};

export const filterEmptyUsers = (runner) => {
    runner.data = runner.data.filter(user => {
        return !isNaN(user.meta.user_id) && Number.isInteger(parseFloat(user.meta.user_id));
    });

    return runner;
};

export const log = async (data) => {
    console.log(JSON.stringify(data))
    // console.log(data)
    return data;
};

export const join = (user, meta) => {
    return {
        ...user,
        meta: {
            ...user.meta,
            ...meta,
        }
    };
};
