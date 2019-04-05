import Enroll from './Enroll';

const setup = () => {
  const props = {
    classes: {
      form: 'form',
      container: 'container',
      paper: 'paper',
      actions: 'actions'
    },
    userInfo: [
      {
        user: 'admin',
        password: 'adminpw',
        affiliation: 'test',
        roles: 'admin'
      }
    ]
  };
  const wrapper = shallow(<Enroll {...props} />);

  return {
    wrapper,
    props
  };
};

describe('Enroll', () => {
  test('Enroll component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test('Enroll state should pass values', () => {
    const { wrapper } = setup();
    wrapper.setState({
      user: 'admin',
      password: 'adminpw',
      affiliation: 'yes',
      roles: 'admin',
      rolesList: ['admin', 'reader', 'writer'],
      isLoading: 'true'
    });
    wrapper.update();
    expect(wrapper.exists()).toBe(true);
  });
});
