let users = [
    {
       name: 'Brynn Tarth',
       avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg',
       subtitle: 'I heard about that last night. Wonder how it will affect students from here on.',
       read: false,
       role: 'RECRUITER',
       time: '3:45pm',
       newMessages: '1',
       messages : [
        {
            _id: 6,
            text: 'I heard about that last night. Wonder how it will affect students from here on.',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'React Native',
              avatar: 'https://placeimg.com/140/140/any',
            }
          },
        {
            _id: 5,
            text: 'Hi Brynn, thank you so much for reaching out! \nI would love to hop on a call with you to discuss more about this opportunity. And I would also like to point out that I am an international student.',
            createdAt: new Date(),
            user: {
              _id: 1,
              name: 'React Native',
              avatar: 'https://placeimg.com/140/140/any',
            }
          },
        {
          _id: 4,
          text: 'Would you be interested in filling a Front End Web Developer role at our company?',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          }
        },
        {
            _id: 3,
            text: 'I came across your profile and thought it was very impressive!',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'React Native',
              avatar: 'https://placeimg.com/140/140/any',
            }
          },
          {
            _id: 2,
            text: 'My name is Brynn, and I am the Technical Recruiter at Greensburg Inc.',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'React Native',
              avatar: 'https://placeimg.com/140/140/any',
            },
        },
        {
            _id: 1,
            text: 'Hi Likhita, how are you?',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'React Native',
              avatar: 'https://placeimg.com/140/140/any',
            },
            
          },
      ]
    },
    {
        name: 'Rachael Simone',
        avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
        subtitle: 'You: How is the job search going for you?',
        read: true,
        role: null,
        time: '3:45pm',
        newMessages: '0',
        messages : [
            {
              _id: 1,
              text: 'How is the job search going for you?',
              createdAt: new Date(),
              user: {
                _id: 2,
                name: 'React Native',
                avatar: 'https://placeimg.com/140/140/any',
              },
              
            },
            
          ]
     },
     {
        name: 'Chris Jackson',
        avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
        subtitle: 'Do you happen to know anyone from Altech Inc? I am really interested in their...',
        read: true,
        role: 'JOB SEEKER',
        time: '3:45pm',
        newMessages: '0',
        messages : [
            {
              _id: 1,
              text: 'Do you happen to know anyone from Altech Inc? I am really interested in their jobs.',
              createdAt: new Date(),
              user: {
                _id: 2,
                name: 'React Native',
                avatar: 'https://placeimg.com/140/140/any',
              },
              
            },            
          ]
     },
     {
        name: 'Jane Doe',
        avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg',
        subtitle: 'I have referred you to my colleague at ABC. They will be reaching out to you shortly.',
        read: false,        
        role: 'PROFESSOR',
        time: '3:45pm',
        newMessages: '1',
        messages : [
            {
              _id: 1,
              text: 'I have referred you to my colleague at ABC. They will be reaching out to you shortly.',
              createdAt: new Date(),
              user: {
                _id: 2,
                name: 'React Native',
                avatar: 'https://placeimg.com/140/140/any',
              },
              
            },            
          ]
     },
     {
        name: 'Robert Brown McCarthy',
        avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
        subtitle: 'I had no idea!',
        read: false,
        role: null,
        time: '3:45pm',
        newMessages: '2',
        messages : [
            {
                _id: 1,
                text: 'I had no idea!',
                createdAt: new Date(),
                user: {
                  _id: 2,
                  name: 'React Native',
                  avatar: 'https://placeimg.com/140/140/any',
                },
                
              }, 
            {
              _id: 2,
              text: 'You go to USC?',
              createdAt: new Date(),
              user: {
                _id: 2,
                name: 'React Native',
                avatar: 'https://placeimg.com/140/140/any',
              },
              
            }, 
                       
          ]
     },
     {
        name: 'Justine Horner',
        avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
        subtitle: 'You:Happy to share my resume!',
        read: true,
        role: null,
        time: '3:45pm',
        newMessages: '0',
        messages : [
            {
                _id: 3,
                text: 'Happy to share my resume!',
                createdAt: new Date(),
                user: {
                  _id: 1,
                  name: 'React Native',
                  avatar: 'https://placeimg.com/140/140/any',
                },
                
              },
            {
              _id: 1,
              text: 'Looking forward to connecting with you to talk more about the job and my skills and experience.',
              createdAt: new Date(),
              user: {
                _id: 1,
                name: 'React Native',
                avatar: 'https://placeimg.com/140/140/any',
              },
              
            },
            {
              _id: 2,
              text: 'Hi Justine! \nHope you are doing well.\nI notice you are hiring Data Scientists for your New Jersey office and I am really interested in this opportunity.',
              createdAt: new Date(),
              user: {
                _id: 1,
                name: 'React Native',
                avatar: 'https://placeimg.com/140/140/any',
              },
            },
          ]
     },

    
   ];

   export {users as users};